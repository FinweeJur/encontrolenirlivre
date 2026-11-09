-- Presenças do encontro (11 a 14/11/2026).
-- Uma linha por pessoa por atividade. Sem CPF, sem telefone.

CREATE TABLE IF NOT EXISTS presencas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  /* chave da atividade: "11-13h-sala-1-ppgcj-gd1" */
  sessao TEXT NOT NULL,
  /* rótulo legível, para o CSV não virar código */
  sessao_titulo TEXT NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  /* hash do IP, só para limitar abuso. Não guarda o IP. */
  ip_hash TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

/* A mesma pessoa não conta duas vezes na mesma atividade. */
CREATE UNIQUE INDEX IF NOT EXISTS presenca_unica
  ON presencas (sessao, email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS presenca_por_sessao ON presencas (sessao);
CREATE INDEX IF NOT EXISTS presenca_por_data ON presencas (criado_em);
