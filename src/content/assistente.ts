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
import { evento, faq, programacao } from "./evento";
import { eixosGd, gdSessoes } from "./gdSessoes";
import { oficinaResumo, oficinas } from "./oficinas";

const PROGRAMACAO_TEXTO = programacao
  .map(
    (dia) =>
      `${dia.dia}/11/2026 (${dia.semana}):\n` +
      dia.itens.map((i) => `  ${i.hora} — ${i.titulo} [${i.tag}]`).join("\n"),
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
Dúvidas de submissão acadêmica: secretaria@ipdms.org.br

ALOJAMENTO
O alojamento é oferecido pela organização a quem responde o formulário: ${evento.links.alojamento}
A vaga é organizada a partir das respostas (nome, contato, chegada e permanência).

LANÇAMENTO DE LIVROS
Acontece na quinta-feira à noite, 12 de novembro, dentro da programação.
Precisa que ao menos uma pessoa autora ou organizadora esteja presente.
A chamada para inscrever obras encerrou em 30 de outubro de 2026.

PROGRAMAÇÃO (sujeita a atualização pela organização)
${PROGRAMACAO_TEXTO}

GRUPOS DE DISCUSSÃO (${TOTAL_GDS} GDs, ${TOTAL_TRABALHOS_GD} trabalhos, com sala e horário)
${GDS_TEXTO}
As sessões acontecem em 11/11 (quarta, 13h) e 12/11 (quinta, 13h30), no Campus I.
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

OBSERVAÇÕES
- Lenir Correia é advogada popular e liderança da luta pela terra; o encontro leva o nome dela como homenagem e pelo lema "Lenir Correia Livre".
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
export const RESPOSTAS_LOCAIS: ReadonlyArray<{
  termos: string[];
  resposta: string;
}> = [
  {
    termos: ["inscri", "sigeventos", "cadastr", "participar"],
    resposta:
      "A inscrição é pelo SIGEventos da UFPB, até 6 de novembro de 2026: cadastre-se escolhendo RENAP, IPDMS ou RENAJU como instituição, confirme o e-mail, inscreva-se como participante e selecione o evento. Depois faça o PIX e envie o comprovante para ipdmscorreio@gmail.com.\n\nhttps://sigeventos.ufpb.br",
  },
  {
    termos: ["valor", "preco", "preço", "quanto custa", "quanto e", "quanto é", "taxa", "pix"],
    resposta:
      "R$ 100 para advogadas, advogados, profissionais e pós-graduação; R$ 50 para estudantes de graduação. O PIX é para ipdmscorreio@gmail.com, e o comprovante vai para o mesmo e-mail.",
  },
  {
    termos: ["isenc", "gratuit", "bolsa"],
    resposta:
      "É possível pedir isenção por e-mail para ipdmscorreio@gmail.com, com nome completo, categoria, justificativa e e-mail de contato.",
  },
  {
    termos: ["alojamento", "moradia", "hospedagem", "dormir", "onde ficar"],
    resposta:
      "O alojamento é organizado a partir do formulário da organização. Preencha com nome, contato e dados de chegada e permanência:\n\nhttps://forms.gle/LoSeGv5YGtpNZVaJ6",
  },
  {
    termos: ["programa", "horario", "horário", "cronograma", "dia 11", "dia 12", "dia 13", "dia 14", "mesa"],
    resposta: `A programação vai de 11 a 14 de novembro, com credenciamento na quarta, mesas, Grupos de Discussão, minicursos e momentos conjuntos. Resumo por dia:\n\n${PROGRAMACAO_TEXTO}`,
  },
  {
    termos: ["edital", "submiss", "trabalho", "artigo", "resumo", "minicurso", "oficina", "livro"],
    resposta: `Os editais do encontro conjunto já tiveram os prazos de submissão encerrados:\n\n${EDITAIS_CURTO}\n\nOs documentos oficiais estão na faixa “Editais e chamadas”, no início da página.`,
  },
  {
    termos: ["gds", "grupo de discuss", "trabalhos aprovados", "aprovado"],
    resposta: `O seminário tem ${TOTAL_GDS} Grupos de Discussão, com ${TOTAL_TRABALHOS_GD} trabalhos, em 11/11 às 13h e 12/11 às 13h30. Cada GD reúne pesquisas de um eixo:\n\n${GDS_TEXTO}\n\nSala, horário e a lista de cada sessão estão na seção “Grupos de Discussão” da página.`,
  },
  {
    termos: ["oficina", "minicurso", "vagas"],
    resposta: `São ${oficinaResumo.total} oficinas e minicursos, com ${oficinaResumo.vagas} vagas cada e inscrição em formulário próprio — separada da inscrição geral:\n\n${oficinas
      .map((o) => `- ${o.dia}/11, ${o.hora}: ${o.titulo}\n  ${o.url}`)
      .join("\n")}`,
  },
  {
    termos: ["local", "endere", "endereço", "ufpb", "mapa", "onde e", "onde é", "campus"],
    resposta:
      "As atividades são no Campus I da Universidade Federal da Paraíba, na Cidade Universitária, s/n, Castelo Branco, João Pessoa/PB. A sala de cada atividade é divulgada pela organização.\n\nhttps://www.google.com/maps/search/?api=1&query=Universidade+Federal+da+Para%C3%ADba+Campus+I",
  },
  {
    termos: ["lenir", "homenage", "homenagem", "quem foi"],
    resposta:
      "O 30º Encontro da RENAP tem o tema “Lenir Correia Livre”, em homenagem a Lenir Correia, advogada popular e liderança da luta pela terra. A trajetória dela abre a seção de homenagem da página, com a nota pública da RENAP.",
  },
  {
    termos: ["seminario", "seminário", "ipdms", "venas"],
    resposta:
      "O XI Seminário do IPDMS tem o tema “Venas abiertas: pesquisas e insurgências na América Latina” e acontece junto ao 30º Encontro da RENAP e ao 20º Encontro da RENAJU, de 11 a 14 de novembro, na UFPB.\n\nhttps://seminariovenasabiertas.pages.dev/",
  },
  {
    termos: ["renaju", "renajupiano"],
    resposta:
      "O 20º Encontro da RENAJU tem o tema “Memórias e dilemas renajupianos” e integra a programação conjunta na UFPB. A RENAJU se apresenta no Instagram como @ajupsbrasil.",
  },
  {
    termos: ["contato", "email", "e-mail", "secretaria", "duvida", "dúvida", "telefone"],
    resposta:
      "Fale com a secretaria do encontro: ipdmscorreio@gmail.com. O site não processa pagamentos nem guarda dados pessoais.",
  },
];

/** Resposta padrão quando nada da base casa com a pergunta. */
export const RESPOSTA_PADRAO =
  "Não encontrei isso nas fontes do site. Escreva para ipdmscorreio@gmail.com ou consulte a página oficial do seminário: https://ipdms.org.br/xi-sn-ipdms/";

/** Sugestões de pergunta, por página. */
export const SUGESTOES: Record<"renap" | "seminario", string[]> = {
  renap: [
    "Como faço a inscrição?",
    "Quanto custa participar?",
    "Tem alojamento?",
    "Quais editais foram publicados?",
  ],
  seminario: [
    "Quais GDs existem?",
    "Como submeto um trabalho?",
    "Qual é a programação do dia 12?",
    "Como peço isenção?",
  ],
};
