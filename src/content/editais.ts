/**
 * Editais e chamadas do encontro conjunto (IPDMS, RENAP e RENAJU).
 *
 * Fonte: páginas oficiais do XI Seminário em ipdms.org.br/xi-sn-ipdms,
 * lidas em 3 de novembro de 2026 (robots libera as páginas públicas,
 * UA honesto). Cada item guarda o prazo como foi publicado e a situação
 * real na data da leitura. Quando a organização publicar novo edital,
 * basta acrescentar aqui: a faixa do topo e o assistente leem esta lista.
 */

export type StatusEdital = "encerrado" | "aberto";

export type Edital = {
  id: string;
  /** Etiqueta curta do tipo de chamada. */
  tipo: string;
  titulo: string;
  /** Duas linhas, no máximo: o que o edital pede. */
  resumo: string;
  prazo: string;
  status: StatusEdital;
  /** Texto do selo: "Encerrado em..." ou "Aberto até...". */
  situacao: string;
  /** Quem assina/organiza a chamada. */
  para: string;
  url: string;
  urlTexto: string;
};

export const editais: Edital[] = [
  {
    id: "trabalhos",
    tipo: "Chamada de trabalhos",
    titulo: "Edital de submissão de trabalhos",
    resumo:
      "Artigos completos e resumos expandidos para apresentação nos Grupos de Discussão do XI Seminário, com regras de autoria e de formatação.",
    prazo: "1º de agosto a 8 de setembro de 2026",
    status: "encerrado",
    situacao: "Encerrado em 8/9",
    para: "IPDMS · GDs",
    url: "https://ipdms.org.br/xi-sn-ipdms/xi-sn-trabalhos/",
    urlTexto: "Ler o edital de trabalhos",
  },
  {
    id: "gds",
    tipo: "Grupos de Discussão",
    titulo: "Envio de propostas de Grupos de Discussão",
    resumo:
      "Propostas de GDs com coordenação, ementa e integrantes, avaliadas pela comissão organizadora do seminário.",
    prazo: "Até 22 de junho de 2026",
    status: "encerrado",
    situacao: "Encerrado em 22/6",
    para: "IPDMS",
    url: "https://ipdms.org.br/xi-sn-ipdms/xi-sn-propostas-gd/",
    urlTexto: "Ler a chamada de GDs",
  },
  {
    id: "minicursos",
    tipo: "Minicursos e oficinas",
    titulo: "Chamada de minicursos e oficinas",
    resumo:
      "Propostas de até três páginas, com ao menos dois integrantes de estados diferentes e dois da RENAP, RENAJU, IPDMS ou de movimento social.",
    prazo: "1º a 23 de agosto de 2026",
    status: "encerrado",
    situacao: "Encerrado em 23/8",
    para: "IPDMS · RENAP · RENAJU",
    url: "https://ipdms.org.br/xi-sn-ipdms/chamada-de-minicursos-e-oficinas/",
    urlTexto: "Ler a chamada de minicursos",
  },
  {
    id: "livros",
    tipo: "Lançamento de livros",
    titulo: "Chamada de lançamento de livros",
    resumo:
      "Livros publicados ou organizados no campo da pesquisa, da assessoria jurídica popular, dos direitos e das lutas dos movimentos sociais.",
    prazo: "Até 30 de outubro de 2026",
    status: "encerrado",
    situacao: "Encerrado em 30/10",
    para: "Conjunta",
    url: "https://ipdms.org.br/xi-sn-ipdms/",
    urlTexto: "Ver a página oficial do seminário",
  },
];
