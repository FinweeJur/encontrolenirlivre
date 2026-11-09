/**
 * Chave estável de cada atividade, usada no QR e no check-in.
 *
 * Formato: `dia-indice`, por exemplo `11-3`. O índice é a posição da
 * atividade no dia, na ordem de `programacaoDetalhada.ts`. É curto o bastante
 * para caber no QR e estável enquanto ninguém reordenar o arquivo.
 */
import { programaDetalhado } from "./programacaoDetalhada";

export type Sessao = {
  chave: string;
  dia: string;
  semana: string;
  hora: string;
  titulo: string;
  local: string | null;
  organizacao: string;
};

export const sessoes: Sessao[] = programaDetalhado.flatMap((dia) =>
  dia.itens.map((item, indice) => ({
    chave: `${dia.dia}-${indice}`,
    dia: dia.dia,
    semana: dia.semana,
    hora: item.hora,
    titulo: item.titulo,
    local: item.local ?? null,
    organizacao: item.tag,
  })),
);

const POR_CHAVE = new Map(sessoes.map((s) => [s.chave, s]));

export function acharSessao(chave: string): Sessao | null {
  return POR_CHAVE.get(chave) ?? null;
}

/** Agrupa por dia, na ordem da programação. */
export function sessoesPorDia(): { dia: string; semana: string; itens: Sessao[] }[] {
  const mapa = new Map<string, { dia: string; semana: string; itens: Sessao[] }>();

  for (const sessao of sessoes) {
    const atual = mapa.get(sessao.dia);
    if (atual) {
      atual.itens.push(sessao);
      continue;
    }
    mapa.set(sessao.dia, {
      dia: sessao.dia,
      semana: sessao.semana,
      itens: [sessao],
    });
  }

  return [...mapa.values()];
}
