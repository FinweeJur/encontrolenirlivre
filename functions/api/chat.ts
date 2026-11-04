/**
 * POST /api/chat — assistente do encontro no Cloudflare Pages Functions.
 *
 * A chave do Zhipu AI fica como segredo do projeto (`ZHIPU_API_KEY`), nunca
 * no bundle: o navegador fala com esta função e esta função fala com o
 * modelo. A base de conhecimento é a mesma das páginas (`src/content/
 * assistente.ts`), montada a partir de `evento.ts` e `editais.ts`.
 *
 * Modelo: glm-4-flash. Sem a chave, responde 503 e o site cai no modo local.
 * Nada de logar pergunta, resposta ou chave.
 */
import { montarSistema } from "../../src/content/assistente";

interface Env {
  ZHIPU_API_KEY?: string;
}

interface Mensagem {
  role: "user" | "assistant";
  content: string;
}

const MODELO = "glm-4-flash";
const ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MAX_MENSAGENS = 8;
const MAX_CHARS = 900;
const JANELA_MS = 60_000;
const MAX_POR_JANELA = 12;

/** Contador simples por isolate: trava abuso barato, não é rate limit global. */
const janelas = new Map<string, number[]>();

function abusando(ip: string): boolean {
  const agora = Date.now();
  const marcas = (janelas.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  marcas.push(agora);
  janelas.set(ip, marcas);
  return marcas.length > MAX_POR_JANELA;
}

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function limparMensagens(entrada: unknown): Mensagem[] {
  if (!Array.isArray(entrada)) return [];

  const limpas: Mensagem[] = [];
  for (const item of entrada.slice(-MAX_MENSAGENS)) {
    if (!item || typeof item !== "object") continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const texto = content.trim().slice(0, MAX_CHARS);
    if (!texto) continue;
    limpas.push({ role, content: texto });
  }
  return limpas;
}

export const onRequestPost = async (contexto: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = contexto;

  // Mesma origem apenas: evita que outro site use a chave como proxy.
  const origem = request.headers.get("origin");
  if (origem) {
    try {
      if (new URL(origem).host !== new URL(request.url).host) {
        return json({ erro: "Origem não autorizada." }, 403);
      }
    } catch {
      return json({ erro: "Origem inválida." }, 403);
    }
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "sem-ip";
  if (abusando(ip)) {
    return json(
      { erro: "Muitas perguntas em pouco tempo. Tente de novo em um minuto." },
      429,
    );
  }

  let corpo: { site?: unknown; messages?: unknown };
  try {
    corpo = (await request.json()) as { site?: unknown; messages?: unknown };
  } catch {
    return json({ erro: "Não entendi o pedido." }, 400);
  }

  const mensagens = limparMensagens(corpo.messages);
  if (mensagens.length === 0 || mensagens[mensagens.length - 1].role !== "user") {
    return json({ erro: "Escreva uma pergunta." }, 400);
  }

  const chave = env.ZHIPU_API_KEY?.trim();
  if (!chave) {
    return json(
      {
        erro:
          "O assistente com IA ainda não está ligado. Use as respostas do modo local ou escreva para ipdmscorreio@gmail.com.",
      },
      503,
    );
  }

  const site = corpo.site === "seminario" ? "seminario" : "renap";

  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), 25_000);

  try {
    const resposta = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${chave}`,
      },
      body: JSON.stringify({
        model: MODELO,
        messages: [{ role: "system", content: montarSistema(site) }, ...mensagens],
        temperature: 0.35,
        top_p: 0.8,
        // Resposta curta também é resposta rápida: o painel é pequeno e o
        // leitor está no celular. Lista de editais cabe em 400 tokens.
        max_tokens: 420,
        stream: false,
      }),
      signal: controle.signal,
    });

    if (!resposta.ok) {
      // Só o status: nada de corpo com detalhe de conta ou chave.
      return json({ erro: "O assistente não respondeu agora. Tente em instantes." }, 502);
    }

    const dados = (await resposta.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };

    const conteudo = dados.choices?.[0]?.message?.content;
    const texto = typeof conteudo === "string" ? conteudo.trim() : "";

    if (!texto) {
      return json({ erro: "O assistente veio vazio. Tente de novo." }, 502);
    }

    return json({ resposta: texto });
  } catch {
    return json(
      { erro: "O assistente demorou demais. Tente de novo ou escreva para ipdmscorreio@gmail.com." },
      504,
    );
  } finally {
    clearTimeout(relogio);
  }
};

/** GET serve de diagnóstico: diz se a chave está configurada, sem exibi-la. */
export const onRequestGet = async (contexto: { env: Env }): Promise<Response> =>
  json({
    ok: true,
    modelo: MODELO,
    ligado: Boolean(contexto.env.ZHIPU_API_KEY),
  });
