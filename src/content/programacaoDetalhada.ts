/**
 * Programação detalhada do encontro conjunto — 11 a 14 de novembro de 2026.
 *
 * Fonte: “PROGRAMAÇÃO DETALHADA ENCONTRÃO”, enviada pela organização em
 * 8 de novembro de 2026. Traz sala de cada atividade, os GDs por dia, as
 * oficinas, as plenárias e a programação cultural.
 *
 * Regra editorial: título e sala vão como no documento. Onde a organização
 * ainda não fixou horário, o campo fica vazio — melhor vazio do que inventado.
 * Ao mudar sala, mude aqui: as duas páginas leem esta lista.
 */

export type TagPrograma = "RENAP" | "IPDMS" | "RENAJU" | "Conjunta" | "Cultural";

export type ItemPrograma = {
  /** Hora como publicada: "13h", "8h30", "12h às 13h". */
  hora: string;
  titulo: string;
  /** Sala e prédio. Vazio quando não há sala fixa. */
  local?: string;
  tag: TagPrograma;
  periodo: "manhã" | "tarde" | "noite";
};

export type DiaPrograma = {
  dia: string;
  semana: string;
  itens: ItemPrograma[];
};

export const programaDetalhado: DiaPrograma[] = [
  {
    dia: "11",
    semana: "quarta",
    itens: [
      {
        hora: "manhã",
        titulo: "Chegança — equipe de acolhimento recebe as pessoas",
        tag: "Conjunta",
        periodo: "manhã",
      },
      {
        hora: "12h às 13h",
        titulo: "Credenciamento",
        local: "Pátio do CCJ",
        tag: "Conjunta",
        periodo: "manhã",
      },
      {
        hora: "13h às 16h30",
        titulo: "GD1 — Direito e Marxismo",
        local: "Sala 1 PPGCJ (CCJ, 1º andar)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h às 16h30",
        titulo: "GD3 — Sistema de justiça e conflitos fundiários",
        local: "Sala H (CCSA)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h às 16h30",
        titulo: "GD6 — Ditaduras e empresas: responsabilização por graves violações de direitos humanos",
        local: "Sala Multimídia (CCJ, 1º andar)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h às 16h30",
        titulo:
          "GD8 — Direito para resistir + GD11 — Conflitos minerários e estratégias jurídico-políticas",
        local: "Sala 4 CCJ (1º andar)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h às 16h30",
        titulo: "GD7 — Gênero, direito e violências interseccionais",
        local: "Sala A CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h às 16h30",
        titulo: "GD9 — Criminologia crítica e movimentos sociais",
        local: "Sala B CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h às 16h30",
        titulo:
          "GD13 — Conflitos socioambientais, ilegalismos do poder e resistências territoriais",
        local: "Sala C CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h às 16h30",
        titulo: "GD14 — AJUPs, assessoria jurídica popular e educação popular",
        local: "Sala D CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "14h",
        titulo: "Oficina — Justiça reprodutiva e racismo: AJUP em casos de violência estatal",
        local: "Sala E CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "14h30",
        titulo: "Oficina — AJUP, violações de direitos humanos e agrotóxicos",
        local: "Sala F CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "14h",
        titulo:
          "Oficina — No tempo da maré e da comunidade: protocolo de consulta dos povos das Águas de Acaú-PB",
        local: "Sala G CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "14h",
        titulo:
          "Oficina — Direito humano à alimentação e à nutrição adequadas e captura corporativa das políticas de alimentação escolar",
        local: "Sala 2 PPGCJ (CCJ, 1º andar)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "18h",
        titulo: "Abertura do encontro",
        local: "OAB/PB — Av. João Cirilo da Silva, 444, Altiplano",
        tag: "Conjunta",
        periodo: "noite",
      },
      {
        hora: "22h",
        titulo: "Luau na praia de Tambaú, no Busto de Tamandaré",
        tag: "Cultural",
        periodo: "noite",
      },
    ],
  },
  {
    dia: "12",
    semana: "quinta",
    itens: [
      {
        hora: "8h30 às 12h",
        titulo: "RENAP — Análise de conjuntura da advocacia popular no Brasil",
        local: "Auditório do CT",
        tag: "RENAP",
        periodo: "manhã",
      },
      {
        hora: "8h30 às 12h",
        titulo: "RENAJU — Memórias e dilemas ajupianos",
        local: "Armazém do Campo",
        tag: "RENAJU",
        periodo: "manhã",
      },
      {
        hora: "8h30 às 12h",
        titulo: "IPDMS — Avanços e desafios: a reforma do estatuto",
        local: "Sala 2 PPGCJ (CCJ, 1º andar)",
        tag: "IPDMS",
        periodo: "manhã",
      },
      {
        hora: "13h30 às 16h30",
        titulo: "GD1 — Direito e Marxismo (2ª e 3ª sessões)",
        local: "Salas 1 e 2 PPGCJ (CCJ, 1º andar)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30 às 16h30",
        titulo:
          "GD2 — Lutas por justiça socioambiental + GD10 — Direito à consulta e consentimento",
        local: "Sala 4 CCJ (1º andar)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30 às 16h30",
        titulo: "GD3 — Sistema de justiça e conflitos territoriais",
        local: "Sala H (CCSA)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30 às 16h30",
        titulo: "GD5 — Movimentos sociais e direito à cidade",
        local: "Sala Multimídia (CCJ, 1º andar)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30 às 16h30",
        titulo: "GD7 — Gênero, direito e violências interseccionais",
        local: "Sala A CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30 às 16h30",
        titulo: "GD9 — Criminologia crítica e movimentos sociais",
        local: "Sala B CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30 às 16h30",
        titulo: "GD12 — Territórios e crise climática",
        local: "Sala 2 CCJ (1º andar)",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30 às 16h30",
        titulo:
          "GD13 — Conflitos socioambientais, ilegalismos do poder e resistências territoriais",
        local: "Sala C CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30 às 16h30",
        titulo: "GD14 — AJUPs, assessoria jurídica popular e educação popular",
        local: "Sala D CCSA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30",
        titulo:
          "RENAP — Discussões por região: Nordeste, Norte, Sudeste, Centro-Oeste e Sul",
        local: "Salas 2, 5, 6, 8 e 9 do CCJ",
        tag: "RENAP",
        periodo: "tarde",
      },
      {
        hora: "19h",
        titulo: "Lançamento de livros e publicações",
        local: "Armazém do Campo",
        tag: "Conjunta",
        periodo: "noite",
      },
      {
        hora: "19h",
        titulo: "Cultural — Samba Ponta Firme",
        local: "Armazém do Campo",
        tag: "Cultural",
        periodo: "noite",
      },
    ],
  },
  {
    dia: "13",
    semana: "sexta",
    itens: [
      {
        hora: "8h30 às 12h",
        titulo: "RENAP — Roda de conversa sobre sustentabilidade na advocacia popular",
        local: "Auditório 411 CCHLA",
        tag: "RENAP",
        periodo: "manhã",
      },
      {
        hora: "8h30 às 12h",
        titulo: "RENAJU — Experiências contemporâneas de AJUP e próximos passos da RENAJU",
        local: "Auditório 412 CCHLA",
        tag: "RENAJU",
        periodo: "manhã",
      },
      {
        hora: "8h30 às 12h",
        titulo:
          "Oficina — Inteligência artificial, ética e direitos humanos: teatro do oprimido",
        local: "Auditório do CT",
        tag: "IPDMS",
        periodo: "manhã",
      },
      {
        hora: "8h30 às 12h",
        titulo:
          "Oficina — Violências e discriminações nas universidades: ferramentas de enfrentamento",
        local: "Sala 1 PPGCJ (CCJ, 1º andar)",
        tag: "IPDMS",
        periodo: "manhã",
      },
      {
        hora: "8h30 às 12h",
        titulo:
          "Oficina — O direito achado na rua e a luta pela terra: sujeito coletivo e conflitos fundiários",
        local: "Sala 2 PPGCJ (CCJ, 1º andar)",
        tag: "IPDMS",
        periodo: "manhã",
      },
      {
        hora: "13h30 às 16h",
        titulo: "Plenária do IPDMS",
        local: "Auditório 411 CCHLA",
        tag: "IPDMS",
        periodo: "tarde",
      },
      {
        hora: "13h30 às 16h",
        titulo: "RENAJU — Teorias críticas da assessoria jurídica popular",
        local: "Auditório 412 CCHLA",
        tag: "RENAJU",
        periodo: "tarde",
      },
      {
        hora: "17h",
        titulo: "Mesa de encerramento do encontro conjunto",
        local: "Auditório 412 CCHLA",
        tag: "Conjunta",
        periodo: "noite",
      },
      {
        hora: "depois da mesa",
        titulo: "Cultural — Centro Cultural Caravela",
        local: "Centro da cidade — Av. General Osório",
        tag: "Cultural",
        periodo: "noite",
      },
    ],
  },
  {
    dia: "14",
    semana: "sábado",
    itens: [
      {
        hora: "8h30 às 12h",
        titulo: "Plenária da RENAP",
        local: "Auditório 412 CCHLA",
        tag: "RENAP",
        periodo: "manhã",
      },
      {
        hora: "8h30 às 12h",
        titulo: "Plenária da RENAJU",
        local: "Auditório 411 CCHLA",
        tag: "RENAJU",
        periodo: "manhã",
      },
      {
        hora: "depois das plenárias",
        titulo: "Cultural — Sabadinho Bom, Beco da Cachaçaria e Bar da Cléa",
        tag: "Cultural",
        periodo: "tarde",
      },
    ],
  },
];

/** Somatório de atividades por organização, para o filtro. */
export const totalPorTag = programaDetalhado
  .flatMap((d) => d.itens)
  .reduce<Record<string, number>>((soma, item) => {
    soma[item.tag] = (soma[item.tag] ?? 0) + 1;
    return soma;
  }, {});

/**
 * Índice do dia de hoje na programação, no fuso de Brasília.
 * `null` quando a data está fora do encontro — aí a página abre no dia padrão.
 */
export function indiceDoDiaAtual(): number | null {
  const agora = new Date(Date.now() - 3 * 3_600_000);
  if (agora.getUTCMonth() + 1 !== 11) return null;

  const dia = agora.getUTCDate();
  const indice = programaDetalhado.findIndex((d) => Number(d.dia) === dia);
  return indice >= 0 ? indice : null;
}
