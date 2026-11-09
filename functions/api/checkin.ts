/**
 * POST /api/checkin — registra presença em uma atividade.
 *
 * Check-in aberto: qualquer pessoa marca a própria presença no QR da sala.
 * Sem login, então o pedido é validado e limitado:
 *  - a chave da atividade tem de existir na programação;
 *  - nome é obrigatório, e-mail é opcional;
 *  - a mesma pessoa (sessão + e-mail) não conta duas vezes;
 *  - 10 envios por minuto por IP, com hash — o IP não é guardado.
 *
 * GET /api/checkin?s=11-3 responde só com o título da atividade, para a página
 * conferir o QR antes de mostrar o formulário.
 */

import type { D1Banco } from "../tipos-d1";
import { acharSessao, sessoes } from "../../src/content/sessoes";

interface Env {
  DB?: D1Banco;
  /* URL do app da web do Apps Script, para espelhar na planilha. */
  PLANILHA_WEBHOOK?: string;
  /* Segredo combinado com o script; sem ele o post é recusado. */
  PLANILHA_TOKEN?: string;
}

const JANELA_MS = 60_000;
const MAX_POR_MINUTO = 10;
const LIMITE_TOTAL = 20_000;

/** Contador por isolate. Segura abuso barato; não é rate limit global. */
const janelas = new Map<string, number[]>();

function json(corpo: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extra,
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
      origem === "http://127.0.0.1:8788")
      ? origem
      : "https://encontrolenirlivre.pages.dev";

  return {
    "access-control-allow-origin": permitido,
    "access-control-allow-methods": "POST, GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  };
}

async function hashIp(ip: string): Promise<string> {
  const dados = new TextEncoder().encode(`ecnl-presenca:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", dados);
  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function abusando(chave: string): boolean {
  const agora = Date.now();
  const marcas = (janelas.get(chave) ?? []).filter((t) => agora - t < JANELA_MS);
  marcas.push(agora);
  janelas.set(chave, marcas);
  return marcas.length > MAX_POR_MINUTO;
}

function limparNome(valor: unknown): string {
  if (typeof valor !== "string") return "";
  return valor.replace(/\s+/g, " ").trim().slice(0, 80);
}

function limparEmail(valor: unknown): string {
  if (typeof valor !== "string") return "";
  const email = valor.trim().toLowerCase().slice(0, 120);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export const onRequestOptions = async (contexto: { request: Request }): Promise<Response> =>
  new Response(null, { status: 204, headers: cors(contexto.request) });

export const onRequestGet = async (contexto: { request: Request }): Promise<Response> => {
  const url = new URL(contexto.request.url);
  const chave = url.searchParams.get("s") ?? "";

  if (chave === "lista") {
    return json(
      { total: sessoes.length, sessoes },
      200,
      cors(contexto.request),
    );
  }

  const sessao = acharSessao(chave);
  if (!sessao) return json({ erro: "Atividade não encontrada." }, 404, cors(contexto.request));

  return json({ sessao }, 200, cors(contexto.request));
};

export const onRequestPost = async (contexto: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = contexto;
  const cabecalhos = cors(request);

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "sem-ip";
  const marca = await hashIp(ip);

  if (abusando(marca)) {
    return json(
      { erro: "Muitas presenças em pouco tempo. Tente de novo em um minuto." },
      429,
      cabecalhos,
    );
  }

  let corpo: { chave?: unknown; nome?: unknown; email?: unknown };
  try {
    corpo = (await request.json()) as typeof corpo;
  } catch {
    return json({ erro: "Não entendi o pedido." }, 400, cabecalhos);
  }

  const chave = typeof corpo.chave === "string" ? corpo.chave.trim() : "";
  const sessao = acharSessao(chave);
  if (!sessao) {
    return json({ erro: "QR inválido. Peça ajuda na recepção." }, 400, cabecalhos);
  }

  const nome = limparNome(corpo.nome);
  if (nome.length < 2) {
    return json({ erro: "Escreva seu nome completo." }, 400, cabecalhos);
  }

  const email = limparEmail(corpo.email);

  if (!env.DB) {
    return json({ erro: "O check-in ainda não está ligado." }, 503, cabecalhos);
  }

  const total = await env.DB.prepare("SELECT COUNT(*) AS n FROM presencas").first<{ n: number }>();
  if ((total?.n ?? 0) >= LIMITE_TOTAL) {
    return json({ erro: "Limite de registros atingido. Fale com a organização." }, 507, cabecalhos);
  }

  try {
    await env.DB.prepare(
      "INSERT INTO presencas (sessao, sessao_titulo, nome, email, ip_hash) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(sessao.chave, sessao.titulo, nome, email || null, marca)
      .run();
  } catch (erro) {
    const texto = String(erro);
    if (texto.includes("UNIQUE") || texto.includes("unique")) {
      return json(
        {
          ok: true,
          duplicado: true,
          mensagem: "Sua presença nesta atividade já estava registrada.",
          titulo: sessao.titulo,
        },
        200,
        cabecalhos,
      );
    }
    return json({ erro: "Não consegui registrar agora. Tente de novo." }, 500, cabecalhos);
  }

  return json(
    {
      ok: true,
      mensagem: "Presença registrada.",
      titulo: sessao.titulo,
      local: sessao.local,
      organizacao: sessao.organizacao,
    },
    200,
    cabecalhos,
  );
};
