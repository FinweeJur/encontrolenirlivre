/**
 * Oficinas e minicursos do XI Seminário, com inscrição própria por formulário.
 *
 * Fonte: programação enviada pela organização em 4 de novembro de 2026 (texto
 * e links do Google Forms). Cada oficina tem 30 vagas e inscrição separada da
 * inscrição geral do encontro — quem só se inscreveu no SIGEventos ainda
 * precisa escolher a oficina aqui.
 *
 * Regra editorial: o título vai como a organização escreveu, sem "arrumar"
 * maiúsculas. Se ela publicar mudança de horário ou link, atualize este
 * arquivo: a página e o assistente leem daqui.
 */

export type Oficina = {
  id: string;
  titulo: string;
  /** Hora de início, como publicada. */
  hora: string;
  dia: "11" | "13";
  url: string;
};

export const oficinas: Oficina[] = [
  {
    id: "justica-reprodutiva",
    titulo:
      "Justiça reprodutiva e Racismo: AJUP em casos de violência estatal",
    hora: "14h",
    dia: "11",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSdCbV-sjrcuMJaLjEFp5LDnGTt6goYjc9Nx55FpUCpsoRpIEw/viewform",
  },
  {
    id: "mare-comunidade",
    titulo:
      "No tempo da maré e da comunidade: Usos do direito, pesquisa-ação e a construção do protocolo de consulta dos povos das Águas de Acaú-PB",
    hora: "14h",
    dia: "11",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSfoEwBvtfAT_ZTSZZoemNIKnc5G9r9jiR5CJT-pNZHzKBdRSQ/viewform",
  },
  {
    id: "agrotoxicos",
    titulo: "AJUP, violações de direitos humanos e agrotóxicos",
    hora: "14h30",
    dia: "11",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSeSCnwyb9L1LpqvQqHzSNNSTuLPbYn7L6wYgx-zJA-UfKP8bw/viewform",
  },
  {
    id: "alimentacao-escolar",
    titulo:
      "Direito humano à alimentação e à nutrição adequadas e conflitos de interesses e captura corporativa das políticas de alimentação escolar",
    hora: "14h",
    dia: "11",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSd1ppgwKcBKPmyuDx-e0ZI1gaQN_SoVR1RNkirRrC1FYbNMiw/viewform",
  },
  {
    id: "ia-teatro",
    titulo:
      "Inteligência artificial, ética e direitos humanos: reflexões críticas a partir do teatro do oprimido",
    hora: "08h30",
    dia: "13",
    url: "https://docs.google.com/forms/d/e/1FAIpQLScvqlHtYZYqGmYj514zGlQCSLKHmihUhAdPIYXeB5yEp4k3FQ/viewform",
  },
  {
    id: "universidades-violencias",
    titulo:
      "Violências e discriminações nas universidades: Parâmetros normativos e ferramentas para o enfrentamento institucional",
    hora: "08h30",
    dia: "13",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSduO4T3f_wsx3baOeJyGLQruqQFMPEyc-_UtAUzkblc5or2-w/viewform",
  },
  {
    id: "direito-achado-na-rua",
    titulo:
      "O direito achado na rua e a luta pela terra: Sujeito coletivo de direito, conflitos fundiários e a produção popular de juridicidade no campo brasileiro",
    hora: "08h30",
    dia: "13",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSeh6YBSA0A_7JGewvn-bOxjjoUjDz2mS2YxM4R4aSPmSkVcqg/viewform",
  },
];

export const oficinaResumo = {
  total: oficinas.length,
  vagas: 30,
  /** Dias em que há oficina, na ordem da programação. */
  dias: [
    { dia: "11", semana: "quarta" },
    { dia: "13", semana: "sexta" },
  ] as const,
};
