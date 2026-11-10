/**
 * POST /api/ressarcimento — pedido de reembolso de Uber e deslocamento.
 *
 * O formulário é aberto, sem login. Cada pedido:
 *  - valida os campos e a quantidade de comprovantes (ou 0 se a pessoa
 *    marcar que vai enviar depois na pasta aberta);
 *  - sobe cada comprovante para a pasta do Google Drive do encontro;
 *  - grava uma linha na aba `ressarcimentos` da planilha.
 *
 * O token do Google fica em segredo do Cloudflare (nunca no repositório).
 * O IP não é guardado: só um contador em memória por isolate.
 */

interface Env {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  DRIVE_FOLDER_ID?: string;
  PLANILHA_ID?: string;
  PLANILHA_ABA?: string;
}

const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
]);

const ENCONTROS: Record<string, string> = {
  RENAP: "30º Encontro Nacional da RENAP",
  IPDMS: "XI Seminário do IPDMS",
  RENAJU: "20º Encontro da RENAJU",
};

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL = 20 * 1024 * 1024;
const EXT_OK = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"]);

const janelas = new Map<string, number[]>();
const JANELA_MS = 60_000;
const MAX_POR_MINUTO = 5;

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function cors(request: Request): Record<string, string> {
  const origem = request.headers.get("origin");
  const permitido =
    origem &&
    (origem.endsWith("encontrolenirlivre.pages.dev") ||
      origem.endsWith("seminariovenasabiertas.pages.dev") ||
      origem === "http://localhost:5173" ||
      origem === "http://127.0.0.1:8788" ||
      origem === "http://127.0.0.1:4173")
      ? origem
      : "https://encontrolenirlivre.pages.dev";
  return {
    "access-control-allow-origin": permitido,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  };
}

export const onRequestOptions = async ({ request }: { request: Request }) =>
  new Response(null, { status: 204, headers: cors(request) });

function abusando(ip: string): boolean {
  const agora = Date.now();
  const marcas = (janelas.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  marcas.push(agora);
  janelas.set(ip, marcas);
  return marcas.length > MAX_POR_MINUTO;
}

function texto(valor: unknown, limite: number): string {
  return String(valor ?? "").replace(/\s+/g, " ").trim().slice(0, limite);
}

function numeroBr(valor: unknown): number {
  const bruto = String(valor ?? "").replace(/[^\d.,-]/g, "").trim();
  if (!bruto) return 0;
  const normalizado =
    bruto.includes(",") && bruto.lastIndexOf(",") > bruto.lastIndexOf(".")
      ? bruto.replace(/\./g, "").replace(",", ".")
      : bruto.replace(/,/g, "");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

function slug(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .toLowerCase();
}

function extensao(arquivo: File): string {
  const achado = /\.([a-zA-Z0-9]{1,5})$/.exec(arquivo.name ?? "");
  if (achado) return achado[1].toLowerCase();
  if (arquivo.type === "application/pdf") return "pdf";
  if (arquivo.type === "image/png") return "png";
  if (arquivo.type === "image/webp") return "webp";
  return "jpg";
}

async function tokenGoogle(env: Env): Promise<string> {
  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_REFRESH_TOKEN
  ) {
    throw new Error("Google não configurado no servidor.");
  }
  const corpo = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  const resposta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: corpo,
  });
  if (!resposta.ok) {
    throw new Error(`Token Google ${resposta.status}`);
  }
  const dados = (await resposta.json()) as { access_token?: string };
  if (!dados.access_token) throw new Error("Token Google vazio.");
  return dados.access_token;
}

async function subirArquivo(
  token: string,
  pasta: string,
  arquivo: File,
  nome: string,
): Promise<{ id: string; webViewLink: string }> {
  const limite = "===============ressarcimento" + crypto.randomUUID().replace(/-/g, "");
  const metadados = JSON.stringify({ name: nome, parents: [pasta] });
  const codificador = new TextEncoder();
  const inicio = codificador.encode(
    `--${limite}\r\n` +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      metadados +
      `\r\n--${limite}\r\n` +
      `Content-Type: ${arquivo.type || "application/octet-stream"}\r\n\r\n`,
  );
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const fim = codificador.encode(`\r\n--${limite}--\r\n`);
  const corpo = new Uint8Array(inicio.length + bytes.length + fim.length);
  corpo.set(inicio, 0);
  corpo.set(bytes, inicio.length);
  corpo.set(fim, inicio.length + bytes.length);

  const url =
    "https://www.googleapis.com/upload/drive/v3/files" +
    "?uploadType=multipart&fields=id,webViewLink";
  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      authorization: "Bearer " + token,
      "content-type": "multipart/related; boundary=" + limite,
    },
    body: corpo as unknown as BodyInit,
  });
  if (!resposta.ok) {
    const detalhe = (await resposta.text()).slice(0, 200);
    throw new Error(`Drive ${resposta.status}: ${detalhe}`);
  }
  return (await resposta.json()) as { id: string; webViewLink: string };
}

async function gravarLinha(
  token: string,
  env: Env,
  linha: (string | number)[],
): Promise<void> {
  const aba = env.PLANILHA_ABA || "ressarcimentos";
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${env.PLANILHA_ID}` +
    `/values/${aba}!A:L:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      authorization: "Bearer " + token,
      "content-type": "application/json",
    },
    body: JSON.stringify({ values: [linha] }),
  });
  if (!resposta.ok) {
    throw new Error(`Planilha ${resposta.status}`);
  }
}

export const onRequestPost = async (contexto: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = contexto;
  const ip = request.headers.get("CF-Connecting-IP") || "sem-ip";
  if (abusando(ip)) {
    return json({ erro: "Muitos envios em pouco tempo. Tente em 1 minuto." }, 429);
  }

  let dados: FormData;
  try {
    dados = await request.formData();
  } catch {
    return json({ erro: "Envio inválido." }, 400);
  }

  if (texto(dados.get("website"), 50)) {
    return json({ ok: true, protocolo: "ignorado" });
  }

  const nome = texto(dados.get("nome"), 120);
  const estado = texto(dados.get("estado"), 2).toUpperCase();
  const organizacao = texto(dados.get("organizacao"), 120);
  const pix = texto(dados.get("pix"), 140);
  const observacoes = texto(dados.get("observacoes"), 1000);
  const enviarDepois = texto(dados.get("enviar_depois"), 3) === "sim";
  const aceite = texto(dados.get("aceite"), 3) === "sim";
  const valor = numeroBr(dados.get("valor"));
  const encontros = dados
    .getAll("encontros")
    .map((item) => texto(item, 10))
    .filter((item) => ENCONTROS[item]);

  if (nome.length < 3) return json({ erro: "Informe o nome completo." }, 400);
  if (!UFS.has(estado)) return json({ erro: "Escolha o estado." }, 400);
  if (organizacao.length < 2) {
    return json({ erro: "Informe a organização." }, 400);
  }
  if (!encontros.length) {
    return json({ erro: "Marque o encontro que você participa." }, 400);
  }
  if (pix.length < 3) return json({ erro: "Informe a chave PIX." }, 400);
  if (valor <= 0) return json({ erro: "Informe o valor solicitado." }, 400);
  if (!aceite) {
    return json({ erro: "É preciso aceitar o aviso sobre a análise." }, 400);
  }

  const arquivos = dados
    .getAll("comprovantes")
    .filter((item): item is File => item instanceof File && item.size > 0);

  let total = 0;
  for (const arquivo of arquivos) {
    if (arquivo.size > MAX_BYTES) {
      return json({ erro: `Cada arquivo pode ter até 8 MB (${arquivo.name}).` }, 400);
    }
    const tipo = arquivo.type || "";
    // Alguns celulares mandam application/octet-stream; a extensão resolve.
    const permitido =
      (tipo.startsWith("image/") && tipo !== "image/svg+xml") ||
      tipo === "application/pdf" ||
      EXT_OK.has(extensao(arquivo));
    if (!permitido) {
      return json({ erro: `Formato não aceito: ${arquivo.name}.` }, 400);
    }
    total += arquivo.size;
  }
  if (total > MAX_TOTAL) {
    return json({ erro: "O total dos comprovantes passa de 20 MB." }, 400);
  }

  if (!env.DRIVE_FOLDER_ID || !env.PLANILHA_ID) {
    return json(
      { erro: "Servidor sem pasta ou planilha configurada. Use a pasta aberta." },
      503,
    );
  }

  const agora = new Date();
  const isoBr = new Date(agora.getTime() - 3 * 3600 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
  const protocolo =
    "R-" +
    isoBr.slice(0, 10).replace(/-/g, "") +
    "-" +
    crypto.randomUUID().slice(0, 4).toUpperCase();

  try {
    const token = await tokenGoogle(env);
    const links: string[] = [];
    for (let i = 0; i < arquivos.length; i += 1) {
      const arquivo = arquivos[i];
      const nomeArquivo =
        `${protocolo}-${slug(nome) || "participante"}-${i + 1}.${extensao(arquivo)}`;
      const enviado = await subirArquivo(token, env.DRIVE_FOLDER_ID, arquivo, nomeArquivo);
      links.push(enviado.webViewLink || "");
    }

    try {
      await gravarLinha(token, env, [
        isoBr,
        protocolo,
        nome,
        estado,
        organizacao,
        encontros.map((item) => ENCONTROS[item]).join(" / "),
        pix,
        valor.toFixed(2).replace(".", ","),
        String(arquivos.length),
        links.join("\n"),
        enviarDepois ? "sim" : "nao",
        observacoes,
      ]);
    } catch (erro) {
      console.log("PLANILHA_FALHOU: " + String(erro));
      return json({
        ok: true,
        protocolo,
        aviso:
          "Comprovantes salvos, mas o registro na planilha falhou. " +
          "Anote o protocolo e avise a comissão.",
      });
    }

    return json({ ok: true, protocolo, arquivos: links.length });
  } catch (erro) {
    console.log("RESSARCIMENTO_FALHOU: " + String(erro));
    return json(
      {
        erro:
          "Não foi possível enviar agora. Tente de novo ou use a pasta aberta.",
      },
      502,
    );
  }
};
