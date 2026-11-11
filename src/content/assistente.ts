/**
 * Base de conhecimento do assistente do encontro.
 *
 * A mesma base serve as duas páginas (RENAP e Seminário do IPDMS) e o
 * endpoint do Cloudflare Pages Functions que conversa com o GLM-4-Flash.
 * Ela é montada a partir de `evento.ts` e `editais.ts` para não envelhecer
 * em dois lugares: mudou o dado, mudou a resposta.
 *
 * Regra editorial: o assistente só pode repetir o que está aqui. O que não
 * está na base vira "não encontrei" e um convite a escrever para a
 * secretaria — nunca invenção.
 */

import { editais } from "./editais";
import { evento, faq } from "./evento";
import { eixosGd, gdSessoes } from "./gdSessoes";
import lancamentos from "./lancamentos.json";
import { oficinaResumo, oficinas } from "./oficinas";
import { programaDetalhado } from "./programacaoDetalhada";

const PROGRAMACAO_TEXTO = programaDetalhado
  .map(
    (dia) =>
      `${dia.dia}/11/2026 (${dia.semana}):\n` +
      dia.itens
        .map(
          (i) =>
            `  ${i.hora} — ${i.titulo}${i.local ? ` (${i.local})` : ""} [${i.tag}]`,
        )
        .join("\n"),
  )
  .join("\n");

const EDITAIS_TEXTO = editais
  .map(
    (e) =>
      `- ${e.titulo} (${e.tipo}; ${e.para}). Prazo: ${e.prazo}. Situação: ${e.situacao}. Link: ${e.url}`,
  )
  .join("\n");

/** Versão curta, para a resposta local no chat (sem URLs enormes). */
const EDITAIS_CURTO = editais
  .map(
    (e) =>
      `- ${e.titulo}: ${e.prazo} — ${e.situacao.toLocaleLowerCase("pt-BR")}.`,
  )
  .join("\n");

/** GDs: uma linha por grupo, com sessões e total. Os títulos não entram. */
const GDS_TEXTO = [...new Set(gdSessoes.map((s) => s.gd))]
  .sort((a, b) => a - b)
  .map((numero) => {
    const sessoes = gdSessoes.filter((s) => s.gd === numero);
    const trabalhos = sessoes.reduce((soma, s) => soma + s.trabalhos.length, 0);
    const quando = sessoes
      .map((s) => `${s.dia} às ${s.hora} (${s.sala})${s.sessao ? `, ${s.sessao}` : ""}`)
      .join("; ");
    return `GD ${numero} — ${sessoes[0].titulo} (${eixosGd[numero] ?? "GD"}): ${trabalhos} trabalhos. ${quando}`;
  })
  .join("\n");

const TOTAL_GDS = new Set(gdSessoes.map((s) => s.gd)).size;
const TOTAL_TRABALHOS_GD = gdSessoes.reduce((soma, s) => soma + s.trabalhos.length, 0);

/** Oficinas: dia, hora e título. Cada uma tem inscrição própria. */
const OFICINAS_TEXTO = oficinas
  .map((o) => `- ${o.dia}/11, ${o.hora}: ${o.titulo}\n  Inscrição: ${o.url}`)
  .join("\n");

const FAQ_TEXTO = faq
  .map(
    (f) =>
      `P: ${f.q}\nR: ${f.a}${f.link ? ` Link: ${f.link.url}` : ""}`,
  )
  .join("\n\n");

/** As 8 obras do lançamento de 12/11, sem telefones. */
const LANCAMENTOS_TEXTO = lancamentos
  .map(
    (livro, indice) =>
      `${indice + 1}. ${livro.titulo} — ${livro.autores} (${livro.vinculo})`,
  )
  .join("\n");

export const BASE_CONHECIMENTO = `ENCONTRO
${evento.nome}, com o tema "${evento.tema}".
Datas: ${evento.dataLonga} (${evento.dataCurta}).
Local: ${evento.local}, ${evento.cidade} — ${evento.endereco}.
Universidade Federal da Paraíba, Campus I.
O encontro acontece junto com:
- XI Seminário Nacional Direitos, Pesquisa e Movimentos Sociais (IPDMS), tema "Venas abiertas: pesquisas e insurgências na América Latina";
- 20º Encontro Nacional da RENAJU, tema "Memórias e dilemas renajupianos".
Os três encontros têm programação própria e momentos conjuntos.

INSCRIÇÃO
Período: ${evento.inscricoesPeriodo}. Inscrições até ${evento.inscricoesAte} de 2026.
Valores: ${evento.valores.map((v) => `${v.categoria}: ${v.valor}`).join("; ")}.
Passo a passo: cadastro no SIGEventos da UFPB (https://sigeventos.ufpb.br), escolhendo RENAP, IPDMS ou RENAJU como instituição; confirmação por e-mail; inscrição como participante; escolha do evento; PIX para ${evento.pix} e envio do comprovante por e-mail.
Link de inscrição: ${evento.links.inscricao}
Isenção: pedido por e-mail para ${evento.email}, com nome completo, categoria, justificativa e e-mail de contato.
Comprovante, isenção e dúvidas: ${evento.email}
Dúvidas de submissão acadêmica: ${evento.email}

ALOJAMENTO
O alojamento é oferecido pela organização a quem responde o formulário: ${evento.links.alojamento}
A vaga é organizada a partir das respostas (nome, contato, chegada e permanência).

LANÇAMENTO DE LIVROS
12/11, às 19h, no Armazém do Campo.
São 8 obras. A lista completa, com autorias e sinopses, está em https://encontrolenirlivre.pages.dev/lancamentos
Precisa que ao menos uma pessoa autora ou organizadora esteja presente.
A chamada para inscrever obras encerrou em 30 de outubro de 2026.
Obras:
${LANCAMENTOS_TEXTO}

PROGRAMAÇÃO (sujeita a atualização pela organização)
${PROGRAMACAO_TEXTO}

GRUPOS DE DISCUSSÃO (${TOTAL_GDS} GDs, ${TOTAL_TRABALHOS_GD} trabalhos, com sala e horário)
${GDS_TEXTO}
As sessões acontecem em 11/11 (quarta, 13h) e 12/11 (quinta, 13h30), no Campus I.
Em 12/11 ficam os GDs 1, 2, 3, 5, 7, 9, 12, 13 e 14; o GD10 acontece junto com o GD2.
O GD11 foi em 11/11, junto com o GD8.
A organização não abriu GDs 4 e 6 neste encontro.

OFICINAS E MINICURSOS (${oficinaResumo.total} oficinas, ${oficinaResumo.vagas} vagas cada, inscrição separada da inscrição geral)
${OFICINAS_TEXTO}

EDITAIS E CHAMADAS (todos com prazo de submissão encerrado em 3/11/2026)
${EDITAIS_TEXTO}

PERGUNTAS FREQUENTES
${FAQ_TEXTO}

LINKS OFICIAIS
SIGEventos/UFPB: ${evento.links.inscricao}
XI Seminário (IPDMS): ${evento.links.ipdms}
Programação oficial: ${evento.links.programacao}
Trabalhos aprovados (PDF): ${evento.links.trabalhos}
Anais do IPDMS: ${evento.links.anais}
Encontros e cartas da RENAP: ${evento.links.encontros}
Nota pública da RENAP sobre a Operação Engodo: ${evento.links.notaRenap}
Reportagem sobre Lenir Correia (A Nova Democracia): ${evento.links.materia}
Página do seminário: https://seminariovenasabiertas.pages.dev/
Página do 30º Encontro da RENAP: https://encontrolenirlivre.pages.dev/
Lançamentos de livros: https://encontrolenirlivre.pages.dev/lancamentos
Ressarcimento de Uber e deslocamento: https://encontrolenirlivre.pages.dev/ressarcimento

OBSERVAÇÕES
- Lenir Correia é advogada popular e liderança da luta pela terra; o encontro leva o nome dela como homenagem e pelo lema "Lenir Correia Livre".
- A presença será registrada por QR code em cada atividade, com check-in no local. A regra de certificado (carga mínima e como pedir) ainda será divulgada pela organização.
- O site não processa pagamentos nem guarda dados pessoais.
- O endereço exato de cada atividade é divulgado pela organização.`;

/** Instrução que acompanha a base em cada página. */
export function montarSistema(site: "renap" | "seminario"): string {
  const pagina =
    site === "seminario"
      ? "Você atende a página do XI Seminário do IPDMS (Venas abiertas)."
      : "Você atende a página do 30º Encontro Nacional da RENAP (Lenir Correia Livre).";

  return `${pagina} Você é um assistente que responde dúvidas sobre o encontro conjunto em João Pessoa, de 11 a 14 de novembro de 2026.

Regras:
1. Responda em português do Brasil, direto, em no máximo quatro frases curtas.
2. Use apenas a BASE DE CONHECIMENTO abaixo. Não invente datas, valores, nomes, salas nem prazos.
3. Se a resposta não estiver na base, diga que não encontrou e indique o e-mail ${evento.email} ou os links oficiais.
4. Cite no máximo um link por resposta, sempre com a URL completa. Escreva a URL crua, sem markdown: nada de [texto](url) nem asteriscos.
5. Não peça nem reproduza dados pessoais, documentos ou senhas.
6. Não dê orientação jurídica nem opinião política em nome das entidades: descreva o que está publicado.
7. Se a pessoa perguntar sobre alojamento, cite o formulário. Se perguntar sobre edital, diga o prazo e a situação real (encerrado ou aberto). Ao listar editais, use uma linha curta por edital, sem link: os documentos estão na faixa "Editais e chamadas", no início da página.
8. Quando a pergunta for sobre a Lenir Correia, seja sóbrio: homenagem do encontro, sem detalhes do processo que não estejam na base.

BASE DE CONHECIMENTO
${BASE_CONHECIMENTO}`;
}

/** Respostas determinísticas usadas quando o modelo não está disponível. */
export type RespostaCurada = {
  /** Identificador curto, para depurar e para amarrar sugestões. */
  id: string;
  termos: string[];
  resposta: string;
};

export const RESPOSTAS_LOCAIS: ReadonlyArray<RespostaCurada> = [
  {
    id: "inscricao",
    termos: ["inscri", "sigeventos", "cadastr", "participar", "matricul"],
    resposta: `A inscrição é pelo SIGEventos da UFPB, de ${evento.inscricoesPeriodo}, e fecha em ${evento.inscricoesAte}. Escolha RENAP, IPDMS ou RENAJU como instituição, confirme o e-mail, inscreva-se como participante e selecione o evento. Depois pague o PIX e envie o comprovante para ${evento.email}.\n\n${evento.links.inscricao}`,
  },
  {
    id: "valores",
    termos: [
      "valor",
      "preco",
      "preço",
      "quanto custa",
      "quanto e",
      "quanto é",
      "taxa",
      "pix",
      "pagamento",
      "comprovante",
    ],
    resposta: `R$ 100 para advogadas, advogados, profissionais e pós-graduação; R$ 50 para estudantes de graduação. O PIX é para ${evento.pix} e o comprovante vai para o mesmo e-mail. O botão “Copiar PIX” na seção de inscrições copia a chave.`,
  },
  {
    id: "isencao",
    termos: ["isenc", "gratuit", "bolsa", "sem pagar"],
    resposta: `Dá para pedir isenção por e-mail para ${evento.email}, com o assunto “Solicitação de Isenção – XI Seminário IPDMS”, informando nome completo, categoria, justificativa e e-mail de contato.`,
  },
  {
    id: "alojamento",
    termos: ["alojamento", "moradia", "hospedagem", "dormir", "onde ficar", "vaga"],
    resposta: `O alojamento é organizado a partir do formulário da organização, com nome, contato e dados de chegada e permanência:\n\n${evento.links.alojamento}`,
  },
  {
    id: "abertura",
    termos: [
      "abertura",
      "oab",
      "altiplano",
      "sede antiga",
      "onde é a abertura",
      "onde fica a abertura",
      "local da abertura",
    ],
    resposta: "A abertura é em 11/11, às 18h, na NOVA sede da OAB/PB, na Av. João Cirilo da Silva, 444, no Altiplano, em João Pessoa. Não é na sede antiga.",
  },
  {
    id: "programacao",
    termos: [
      "programa",
      "horario",
      "horário",
      "cronograma",
      "agenda",
      "dia 11",
      "dia 12",
      "dia 13",
      "dia 14",
      "mesa",
      "abertura",
      "credenciamento",
    ],
    resposta: `A programação vai de 11 a 14 de novembro, com sala em cada atividade. O credenciamento é em 11/11, das 12h às 13h, no pátio do CCJ; os GDs começam às 13h. A abertura é às 18h na NOVA sede da OAB/PB, na Av. João Cirilo da Silva, 444, no Altiplano — não é na sede antiga. Em 12/11 o lançamento de livros e o samba são no Armazém do Campo. A grade completa, com filtro por organização, está na seção “Programação” da página.`,
  },
  {
    id: "editais",
    termos: ["edital", "submiss", "submet", "artigo", "resumo", "chamada"],
    resposta: `Os editais do encontro conjunto já tiveram os prazos de submissão encerrados:\n\n${EDITAIS_CURTO}\n\nOs documentos oficiais estão na faixa “Editais e chamadas”, no início da página.`,
  },
  {
    id: "gds",
    termos: ["gds", "grupo de discuss", "grupos de discuss", "trabalho", "aprovad"],
    resposta: `São ${TOTAL_GDS} Grupos de Discussão, com ${TOTAL_TRABALHOS_GD} trabalhos, em 11/11 às 13h e 12/11 às 13h30. Cada GD tem sala própria e uma ou mais sessões. As submissões já encerraram e a lista aprovada está na seção “Grupos de Discussão”: https://seminariovenasabiertas.pages.dev/#gds`,
  },
  {
    id: "oficinas",
    termos: ["oficina", "minicurso", "vagas"],
    resposta: `São ${oficinaResumo.total} oficinas e minicursos, com ${oficinaResumo.vagas} vagas cada e inscrição em formulário próprio — separada da inscrição geral. Programação e links: https://seminariovenasabiertas.pages.dev/#oficinas`,
  },
  {
    id: "local",
    termos: [
      "local",
      "endere",
      "endereço",
      "ufpb",
      "onde e",
      "onde é",
      "onde fica",
      "campus",
      "cheg",
      "mapa",
    ],
    resposta: `As atividades são no Campus I da Universidade Federal da Paraíba, na Cidade Universitária, s/n, Castelo Branco, João Pessoa/PB. A sala de cada atividade está na programação.\n\nhttps://www.google.com/maps/search/?api=1&query=Universidade+Federal+da+Para%C3%ADba+Campus+I`,
  },
  {
    id: "presenca",
    termos: ["certificad", "presenca", "presença", "check-in", "checkin", "qr", "frequencia", "frequência"],
    resposta: "A organização vai registrar presença por QR code em cada atividade, com check-in no local. A regra de certificado — carga mínima e como pedir — ainda não foi publicada; confirme na secretaria: ipdmscorreio@gmail.com.",
  },
  {
    id: "livros",
    termos: ["lancamento", "lançamento", "livro", "obra"],
    resposta: "O lançamento de livros é em 12/11, às 19h, no Armazém do Campo. São 8 obras; a lista completa, com autorias e sinopses, está em https://encontrolenirlivre.pages.dev/lancamentos",
  },
  {
    id: "ressarcimento",
    termos: ["ressarcimento", "reembolso", "uber", "deslocamento", "comprovante de uber"],
    resposta: "O pedido de ressarcimento de Uber e deslocamento é feito em https://encontrolenirlivre.pages.dev/ressarcimento. Informe estado, organização, encontro, chave PIX e valor; os comprovantes são opcionais. O pedido não é confirmação: será dialogado com a articulação nacional e o representante do estado.",
  },
  {
    id: "lenir",
    termos: ["lenir", "homenage", "homenagem", "quem foi"],
    resposta: "O 30º Encontro da RENAP tem o tema “Lenir Correia Livre”, em homenagem a Lenir Correia, advogada popular e liderança da luta pela terra. A trajetória dela abre a seção de homenagem da página, com a nota pública da RENAP.",
  },
  {
    id: "seminario",
    termos: ["seminario", "seminário", "ipdms", "venas"],
    resposta: "O XI Seminário do IPDMS tem o tema “Venas abiertas: pesquisas e insurgências na América Latina” e acontece junto ao 30º Encontro da RENAP e ao 20º Encontro da RENAJU, de 11 a 14 de novembro, na UFPB.\n\nhttps://seminariovenasabiertas.pages.dev/",
  },
  {
    id: "renap",
    termos: ["renap", "30º", "30o encontro", "lenir correia livre"],
    resposta: "O 30º Encontro Nacional da RENAP tem o tema “Lenir Correia Livre” e acontece de 11 a 14 de novembro de 2026, na UFPB, em João Pessoa, junto ao XI Seminário do IPDMS e ao 20º Encontro da RENAJU.\n\nhttps://encontrolenirlivre.pages.dev/",
  },
  {
    id: "renaju",
    termos: ["renaju", "renajupiano", "ajups"],
    resposta: "O 20º Encontro da RENAJU tem o tema “Memórias e dilemas renajupianos” e integra a programação conjunta na UFPB. A RENAJU se apresenta no Instagram como @ajupsbrasil.",
  },
  {
    id: "contato",
    termos: ["contato", "email", "e-mail", "secretaria", "duvida", "dúvida", "telefone", "falo", "falar"],
    resposta: `Fale com a secretaria do encontro: ${evento.email}. O site não processa pagamentos nem guarda dados pessoais.`,
  },
];

/** Resposta padrão quando nada da base casa com a pergunta. */
export const RESPOSTA_PADRAO =
  "Não encontrei isso nas fontes do site. Escreva para ipdmscorreio@gmail.com ou consulte a página oficial do seminário: https://ipdms.org.br/xi-sn-ipdms/";

const semAcento = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Procura a resposta curada mais provável.
 *
 * A pontuação soma o tamanho dos termos encontrados: "grupo de discussão"
 * (18) vence "gd" (2) numa pergunta que cita os dois. Exige pontuação mínima
 * para não responder besteira — abaixo disso o modelo (ou a resposta padrão)
 * assume.
 */
export function responderCurada(pergunta: string): RespostaCurada | null {
  const alvo = semAcento(pergunta);
  let melhor: RespostaCurada | null = null;
  let pontos = 0;

  for (const item of RESPOSTAS_LOCAIS) {
    const soma = item.termos.reduce(
      (total, termo) => (alvo.includes(semAcento(termo)) ? total + semAcento(termo).length : total),
      0,
    );
    if (soma > pontos) {
      pontos = soma;
      melhor = item;
    }
  }

  return pontos >= 3 ? melhor : null;
}

/**
 * Tópicos perguntáveis, na ordem em que aparecem no painel.
 *
 * Cada `pergunta` foi escrita para casar com os `termos` de `RESPOSTAS_LOCAIS`
 * (e não com o modelo): é o que garante resposta pronta, na hora e revisada.
 * `rotulo` é o texto curto do chip; a pergunta completa fica no `title` e na
 * lista de "Ver mais perguntas".
 */
export type Topico = {
  id: string;
  rotulo: string;
  pergunta: string;
};

export const TOPICOS: Topico[] = [
  { id: "inscricao", rotulo: "Inscrição", pergunta: "Como faço a inscrição?" },
  { id: "valores", rotulo: "Valores", pergunta: "Quanto custa e qual é o PIX?" },
  { id: "isencao", rotulo: "Isenção", pergunta: "Como pedir isenção?" },
  { id: "alojamento", rotulo: "Alojamento", pergunta: "Tem alojamento?" },
  { id: "programacao", rotulo: "Programação", pergunta: "Qual é a programação?" },
  { id: "editais", rotulo: "Editais", pergunta: "Qual é o prazo dos editais?" },
  { id: "gds", rotulo: "GDs", pergunta: "Quais GDs e trabalhos aprovados?" },
  { id: "oficinas", rotulo: "Oficinas", pergunta: "Que oficinas têm?" },
  { id: "local", rotulo: "Local", pergunta: "Onde fica e como chego?" },
  { id: "presenca", rotulo: "Presença", pergunta: "Como funciona a presença?" },
  { id: "livros", rotulo: "Livros", pergunta: "Como funciona o lançamento de livros?" },
  { id: "ressarcimento", rotulo: "Reembolso", pergunta: "Como peço ressarcimento de Uber?" },
  { id: "contato", rotulo: "Contato", pergunta: "Com quem falo?" },
];

/**
 * Sugestões de pergunta, por página.
 *
 * São quatro perguntas que existem em `TOPICOS` — o texto é o mesmo, de
 * propósito, para não criar duas versões da mesma pergunta.
 */
export const SUGESTOES: Record<"renap" | "seminario", string[]> = {
  renap: [
    "Como faço a inscrição?",
    "Quanto custa e qual é o PIX?",
    "Tem alojamento?",
    "Onde fica e como chego?",
  ],
  seminario: [
    "Como faço a inscrição?",
    "Que oficinas têm?",
    "Quais GDs e trabalhos aprovados?",
    "Como funciona a presença?",
  ],
};
