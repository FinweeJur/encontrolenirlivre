/**
 * Conteúdo factual do 30º Encontro Nacional da RENAP.
 * Fontes: página oficial do XI Seminário (ipdms.org.br/xi-sn-ipdms),
 * SIGEventos/UFPB e reportagem da A Nova Democracia sobre Lenir Correia.
 * Tudo que muda de um dia para o outro deve morar aqui.
 */

export const evento = {
  nome: "30º Encontro Nacional da RENAP",
  tema: "Lenir Correia Livre",
  dataCurta: "11—14 NOV 2026",
  dataLonga: "11 a 14 de novembro de 2026",
  local: "UFPB · Campus I",
  cidade: "João Pessoa · PB",
  endereco: "Cidade Universitária, s/n, Castelo Branco, João Pessoa/PB",
  inscricoesAte: "6 de novembro",
  inscricoesPeriodo: "13 de outubro a 6 de novembro de 2026",
  valores: [
    {
      categoria: "Profissionais, pós-graduação e advogadas/os",
      valor: "R$ 100",
    },
    { categoria: "Estudantes de graduação", valor: "R$ 50" },
  ],
  pix: "ipdmscorreio@gmail.com",
  email: "ipdmscorreio@gmail.com",
  links: {
    inscricao: "https://sigeventos.ufpb.br/eventos/public/evento/SNIPDMS",
    ipdms: "http://ipdms.org.br/xi-sn-ipdms/",
    programacao: "https://ipdms.org.br/xi-sn-ipdms/programacao/",
    anais: "https://ipdms.org.br/anais/",
    trabalhos:
      "https://ipdms.org.br/wp-content/uploads/2026/07/Trabalhos-Aprovados-1.pdf",
    materia:
      "https://anovademocracia.com.br/godos-lenir-correia-luta-pela-terra-abrapo/",
    // Formulário da organização: é por ele que se pede o alojamento.
    alojamento: "https://forms.gle/LoSeGv5YGtpNZVaJ6",
    // Nota pública da RENAP sobre a Operação Engodo e a prisão da Lenir.
    notaRenap:
      "https://www.renap.org.br/post/nota-p%C3%BAblica-opera%C3%A7%C3%A3o-engodo-pela-imediata-revoga%C3%A7%C3%A3o-da-pris%C3%A3o-da-advogada-popular-lenir-correia",
    // Página de encontros da RENAP (histórico, fotos e cartas).
    encontros: "https://www.renap.org.br/encontro-nacional",
  },
  coEventos: [
    {
      numero: "XI",
      nome: "Seminário Nacional Direitos, Pesquisa e Movimentos Sociais",
      sigla: "IPDMS",
      tema: "Venas abiertas: pesquisas e insurgências na América Latina",
    },
    {
      numero: "30º",
      nome: "Encontro Nacional da Rede Nacional de Advogadas e Advogados Populares",
      sigla: "RENAP",
      tema: "Lenir Correia Livre",
    },
    {
      numero: "20º",
      nome: "Encontro Nacional da Rede Nacional de Assessoria Jurídica Universitária",
      sigla: "RENAJU",
      tema: "Memórias e dilemas renajupianos",
    },
  ],
} as const;

export type Tag = "RENAP" | "IPDMS" | "RENAJU" | "Conjunta";

export const programacao: {
  dia: string;
  semana: string;
  itens: { hora: string; titulo: string; tag: Tag }[];
}[] = [
  {
    dia: "11",
    semana: "quarta",
    itens: [
      { hora: "12h", titulo: "Abertura do credenciamento", tag: "Conjunta" },
      {
        hora: "13h",
        titulo: "Apresentação dos trabalhos · Grupos de Discussão",
        tag: "IPDMS",
      },
      {
        hora: "18h",
        titulo:
          "Mesa de abertura: “Venas abiertas: pesquisas e insurgências na América Latina”",
        tag: "Conjunta",
      },
    ],
  },
  {
    dia: "12",
    semana: "quinta",
    itens: [
      {
        hora: "8h30",
        titulo: "Análise de conjuntura da advocacia popular no Brasil",
        tag: "RENAP",
      },
      {
        hora: "8h30",
        titulo: "IPDMS: avanços e desafios — a reforma do estatuto",
        tag: "IPDMS",
      },
      {
        hora: "8h30",
        titulo: "RENAJU: memórias e dilemas renajupianos",
        tag: "RENAJU",
      },
      {
        hora: "13h30",
        titulo: "Apresentação dos trabalhos · Grupos de Discussão",
        tag: "IPDMS",
      },
      { hora: "16h", titulo: "Discussões por região", tag: "RENAP" },
      {
        hora: "19h",
        titulo: "Lançamento de livros e publicações · evento cultural",
        tag: "Conjunta",
      },
    ],
  },
  {
    dia: "13",
    semana: "sexta",
    itens: [
      {
        hora: "8h30",
        titulo: "Roda de conversa sobre sustentabilidade na advocacia popular",
        tag: "RENAP",
      },
      {
        hora: "8h30",
        titulo: "Oficinas e minicursos",
        tag: "IPDMS",
      },
      {
        hora: "8h30",
        titulo:
          "Experiências contemporâneas de AJUP e próximos passos da RENAJU",
        tag: "RENAJU",
      },
      { hora: "13h30", titulo: "Plenária do IPDMS", tag: "IPDMS" },
      {
        hora: "13h30",
        titulo: "Teorias críticas da assessoria jurídica popular",
        tag: "RENAJU",
      },
      {
        hora: "17h",
        titulo: "Mesa de encerramento do Seminário · momento cultural",
        tag: "Conjunta",
      },
    ],
  },
  {
    dia: "14",
    semana: "sábado",
    itens: [
      { hora: "8h30", titulo: "Plenária da RENAP", tag: "RENAP" },
      { hora: "8h30", titulo: "Plenária da RENAJU", tag: "RENAJU" },
    ],
  },
];

export const organizacoes = [
  {
    sigla: "RENAP",
    nome: "Rede Nacional de Advogadas e Advogados Populares",
    descricao:
      "Articulação descentralizada da advocacia popular, criada em 1995. Atua junto aos movimentos sociais e às lutas por direitos.",
    site: "https://www.renap.org.br/",
    instagram: "https://www.instagram.com/renapbrasil/",
    handle: "@renapbrasil",
  },
  {
    sigla: "IPDMS",
    nome: "Instituto de Pesquisa, Direitos e Movimentos Sociais",
    descricao:
      "Pesquisa militante em direito, assessoria popular e formação crítica conectada às lutas sociais.",
    site: "https://ipdms.org.br/",
    instagram: "https://www.instagram.com/institutoipdms/",
    handle: "@institutoipdms",
  },
  {
    sigla: "RENAJU",
    nome: "Rede Nacional de Assessoria Jurídica Universitária",
    descricao:
      "Estudantes e grupos de assessoria jurídica universitária popular de todo o país.",
    site: null,
    instagram: "https://www.instagram.com/ajupsbrasil/",
    handle: "@ajupsbrasil",
  },
] as const;

export const faq: ReadonlyArray<{
  q: string;
  a: string;
  /** Link opcional ao fim da resposta (ex.: formulário do alojamento). */
  link?: { texto: string; url: string };
}> = [
  {
    q: "Quem pode participar?",
    a: "Estudantes de graduação e pós-graduação, pesquisadoras e pesquisadores, docentes, advogadas e advogados, demais profissionais, integrantes de movimentos sociais e outras pessoas interessadas no tema.",
  },
  {
    q: "Como faço a inscrição?",
    a: "O cadastro e a inscrição são pelo SIGEventos da UFPB. Escolha a instituição RENAP, IPDMS ou RENAJU, confirme o e-mail, inscreva-se como participante e selecione o XI Seminário. Depois, faça o PIX e envie o comprovante.",
  },
  {
    q: "Quanto custa?",
    a: "R$ 100 para profissionais, pós-graduação e advogadas/os; R$ 50 para estudantes de graduação. O pagamento é por PIX para ipdmscorreio@gmail.com.",
  },
  {
    q: "Posso pedir isenção?",
    a: "Sim. Envie um e-mail para ipdmscorreio@gmail.com com o assunto “Solicitação de Isenção – XI Seminário IPDMS”, informando nome completo, categoria, justificativa e e-mail para contato.",
  },
  {
    q: "Onde envio o comprovante?",
    a: "Para ipdmscorreio@gmail.com. Dúvidas sobre pagamento, isenção e inscrição também vão para esse endereço.",
  },
  {
    q: "O evento oferece alojamento?",
    a: "Sim. O alojamento é oferecido a quem responde o formulário da organização, com nome, contato e dados de chegada e permanência. A vaga é organizada a partir das respostas.",
    link: {
      texto: "Formulário do alojamento",
      url: "https://forms.gle/LoSeGv5YGtpNZVaJ6",
    },
  },
  {
    q: "Onde serão as atividades?",
    a: "No Campus I da UFPB, em João Pessoa. A sala de cada atividade será divulgada pela organização no site do evento.",
  },
];

/**
 * Fotos da grade infinita — duas origens apenas:
 * 1. as fotos enviadas pelo dono no chat (21 registros dos encontros);
 * 2. as capas das cartas políticas do site renap.org.br (5 encontros).
 * Nada de banco de imagens antigo: o que não veio dessas duas fontes saiu.
 */
export const galeria = [
  // Fotos enviadas no chat.
  "/img/galeria-renap/grade-grupo-mural.webp",
  "/img/galeria-renap/grade-mg-3871.webp",
  "/img/galeria-renap/grade-mg-3943.webp",
  "/img/galeria-renap/grade-mg-3971.webp",
  "/img/galeria-renap/grade-mg-3534.webp",
  "/img/galeria-renap/grade-mg-3564.webp",
  "/img/galeria-renap/grade-chat-01.webp",
  "/img/galeria-renap/grade-chat-02.webp",
  "/img/galeria-renap/grade-chat-03.webp",
  "/img/galeria-renap/grade-chat-04.webp",
  "/img/galeria-renap/grade-chat-05.webp",
  "/img/galeria-renap/grade-chat-06.webp",
  "/img/galeria-renap/grade-chat-07.webp",
  "/img/galeria-renap/grade-chat-08.webp",
  "/img/galeria-renap/grade-chat-09.webp",
  "/img/galeria-renap/grade-chat-10.webp",
  "/img/galeria-renap/grade-chat-11.webp",
  "/img/galeria-renap/grade-chat-12.webp",
  "/img/galeria-renap/grade-chat-13.webp",
  "/img/galeria-renap/grade-chat-14.webp",
  "/img/galeria-renap/grade-chat-15.webp",
  // Registros do ZIP enviado no chat.
  "/img/galeria-renap/grade-encontro-a.webp",
  "/img/galeria-renap/grade-encontro-b.webp",
  "/img/galeria-renap/grade-encontro-c.webp",
  "/img/galeria-renap/grade-encontro-d.webp",
  // Capas das cartas políticas (renap.org.br/encontro-nacional).
  "/img/galeria-renap/grade-2025-salvador.webp",
  "/img/galeria-renap/grade-ro-2023.webp",
  "/img/galeria-renap/grade-rs-2019.webp",
  "/img/galeria-renap/grade-xxiii-2018.webp",
  "/img/galeria-renap/grade-articulacao-2018.webp",
];

/**
 * Cartas políticas e notas dos encontros anteriores da RENAP.
 * Fonte: blog oficial (renap.org.br). As capas foram baixadas do próprio site
 * da rede (robots libera `/`; UA honesto) e reduzidas para 900 px de largura.
 */
export const cartas = [
  {
    ano: "2025",
    titulo: "29º Encontro Nacional — 30 anos em defesa da justiça social",
    local: "Salvador · BA",
    imagem: "/img/galeria-renap/2025-salvador.webp",
    url: "https://www.renap.org.br/encontro-nacional",
  },
  {
    ano: "2024",
    titulo: "XXVIII Encontro Nacional — carta política",
    local: "São Paulo",
    imagem: "/img/galeria-renap/sp-2024.webp",
    url: "https://www.renap.org.br/post/renap-divulga-a-carta-pol%C3%ADtica-do-seu-xviii-encontro-em-sp",
  },
  {
    ano: "2023",
    titulo: "Encontro de Rondônia — carta política",
    local: "Rondônia",
    imagem: "/img/galeria-renap/ro-2023.webp",
    url: "https://www.renap.org.br/post/renap-divulga-carta-pol%C3%ADtica-do-encontro-de-rond%C3%B4nia",
  },
  {
    ano: "2019",
    titulo: "Encontro do RENAP/RS — conjuntura sociopolítica",
    local: "Rio Grande do Sul",
    imagem: "/img/galeria-renap/rs-2019.webp",
    url: "https://www.renap.org.br/post/renap-rs-re%C3%BAne-se-para-debater-a-conjuntura-sociopol%C3%ADtica",
  },
  {
    ano: "2018",
    titulo: "XXIII Encontro Nacional — carta política",
    local: "Brasil",
    imagem: "/img/galeria-renap/xxiii-2018.webp",
    url: "https://www.renap.org.br/post/xxiii-encontro-nacional-da-renap-carta-pol%C3%ADtica",
  },
  {
    ano: "2018",
    titulo: "Encontro de Articulação — carta política",
    local: "Brasil",
    imagem: "/img/galeria-renap/articulacao-2018.webp",
    url: "https://www.renap.org.br/post/carta-pol%C3%ADtica-do-encontro-de-articula%C3%A7%C3%A3o",
  },
] as const;
