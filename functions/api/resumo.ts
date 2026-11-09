/**
 * GET /api/resumo?token=... — números do check-in para o painel.
 *
 * Devolve só o necessário para acompanhar ao vivo: total, contagem por dia,
 * contagem por atividade e as últimas presenças **sem e-mail**. Nome aparece
 * porque a comissão precisa conferir na hora; e-mail só no CSV protegido.
 */
import { acharSessao, sessoes } from "../../src/content/sessoes";
import type { D1Banco } from "../tipos-d1";

interface Env {
  DB?: D1Banco;
  PRESENCA_TOKEN?: string;
}

type Contagem = { sessao: string; total: number; ultima: string | null };
type Recente = { nome: string; sessao: string; quando: string };

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

export const onRequestGet = async (contexto: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = contexto;
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const esperado = env.PRESENCA_TOKEN?.trim();

  if (!esperado) return json({ erro: "Painel desligado: falta PRESENCA_TOKEN." }, 503);
  if (token !== esperado) return json({ erro: "Senha incorreta." }, 403);
  if (!env.DB) return json({ erro: "Banco não configurado." }, 503);

  const total = await env.DB.prepare("SELECT COUNT(*) AS n FROM presencas").first<{ n: number }>();

  const { results: porDia } = await env.DB.prepare(
    "SELECT substr(sessao, 1, instr(sessao, '-') - 1) AS dia, COUNT(*) AS total FROM presencas GROUP BY dia ORDER BY dia",
  ).all<{ dia: string; total: number }>();

  const { results: porSessao } = await env.DB.prepare(
    "SELECT sessao, COUNT(*) AS total, MAX(criado_em) AS ultima FROM presencas GROUP BY sessao",
  ).all<Contagem>();

  const { results: recentes } = await env.DB.prepare(
    "SELECT nome, sessao, criado_em AS quando FROM presencas ORDER BY id DESC LIMIT 25",
  ).all<Recente>();

  const mapa = new Map(porSessao.map((c) => [c.sessao, c]));

  const atividades = sessoes.map((s) => {
    const c = mapa.get(s.chave);
    return {
      chave: s.chave,
      dia: s.dia,
      hora: s.hora,
      titulo: s.titulo,
      local: s.local,
      organizacao: s.organizacao,
      total: c?.total ?? 0,
      ultima: c?.ultima ?? null,
    };
  });

  const feed = recentes.map((r) => {
    const s = acharSessao(r.sessao);
    return {
      nome: r.nome,
      atividade: s ? `${s.dia}/11 ${s.hora} — ${s.titulo}` : r.sessao,
      quando: r.quando,
    };
  });

  return json({
    total: total?.n ?? 0,
    porDia,
    atividades,
    recentes: feed,
    atualizadoEm: new Date().toISOString(),
  });
};
