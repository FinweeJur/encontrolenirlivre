/**
 * GET /api/placar — contagem pública de presenças, sem dado pessoal.
 *
 * É o link que vai nos avisos de marco ("50 pessoas já fizeram check-in").
 * O painel com nomes e e-mails continua atrás de senha; aqui só saem números
 * por dia e por atividade. Nenhum nome, e-mail, IP ou horário individual.
 *
 * Cache curto na borda: o placar atualiza sozinho a cada 20 s, e a consulta
 * ao D1 não precisa ser repetida para cada visitante.
 */
import { sessoes } from "../../src/content/sessoes";
import type { D1Banco } from "../tipos-d1";

interface Env {
  DB?: D1Banco;
}

type Contagem = { sessao: string; total: number };

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=20",
    },
  });
}

export const onRequestGet = async (contexto: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { env } = contexto;
  if (!env.DB) return json({ erro: "Banco não configurado." }, 503);

  const total = await env.DB.prepare("SELECT COUNT(*) AS n FROM presencas").first<{
    n: number;
  }>();

  const { results: porDia } = await env.DB.prepare(
    "SELECT substr(sessao, 1, instr(sessao, '-') - 1) AS dia, COUNT(*) AS total FROM presencas GROUP BY dia ORDER BY dia",
  ).all<{ dia: string; total: number }>();

  const { results: porSessao } = await env.DB.prepare(
    "SELECT sessao, COUNT(*) AS total FROM presencas GROUP BY sessao",
  ).all<Contagem>();

  const mapa = new Map(porSessao.map((c) => [c.sessao, c.total]));

  const atividades = sessoes
    .map((s) => ({
      chave: s.chave,
      dia: s.dia,
      hora: s.hora,
      titulo: s.titulo,
      local: s.local,
      organizacao: s.organizacao,
      total: mapa.get(s.chave) ?? 0,
    }))
    .filter((a) => a.total > 0);

  return json({
    total: total?.n ?? 0,
    porDia,
    atividades,
    atualizadoEm: new Date().toISOString(),
  });
};
