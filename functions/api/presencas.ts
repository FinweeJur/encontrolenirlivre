/**
 * GET /api/presencas?token=... — exporta as presenças em CSV.
 *
 * Fica fechado por token (segredo do projeto, `PRESENCA_TOKEN`). Sem o token,
 * ninguém baixa nome e e-mail de participante. A resposta é CSV para abrir no
 * Excel e montar certificado.
 */

import type { D1Banco } from "../tipos-d1";
interface Env {
  DB?: D1Banco;
  PRESENCA_TOKEN?: string;
}

type Linha = {
  sessao: string;
  sessao_titulo: string;
  nome: string;
  email: string | null;
  criado_em: string;
};

export const onRequestGet = async (contexto: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = contexto;
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  const esperado = env.PRESENCA_TOKEN?.trim();
  if (!esperado) {
    return new Response("Exportação desligada: falta o segredo PRESENCA_TOKEN.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  if (token !== esperado) {
    return new Response("Token inválido.", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  if (!env.DB) {
    return new Response("Banco não configurado.", { status: 503 });
  }

  const { results } = await env.DB.prepare(
    "SELECT sessao, sessao_titulo, nome, email, criado_em FROM presencas ORDER BY criado_em ASC",
  ).all<Linha>();

  const escapar = (valor: string | null) =>
    `"${String(valor ?? "").replace(/"/g, '""')}"`;

  const linhas = [
    "sessao,titulo,nome,email,quando",
    ...results.map((l) =>
      [l.sessao, l.sessao_titulo, l.nome, l.email ?? "", l.criado_em]
        .map((v) => escapar(v))
        .join(","),
    ),
  ];

  return new Response(linhas.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="presencas-encontrao-2026.csv"',
      "cache-control": "no-store",
    },
  });
};
