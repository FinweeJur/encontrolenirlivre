/**
 * Carta Política do XXX Encontro Nacional da RENAP (João Pessoa, 2026).
 *
 * Texto integral publicado pela própria RENAP no blog oficial:
 * https://www.renap.org.br/post/carta-politica-do-xxx-encontro-nacional-da-rede-nacional-de-advogadas-e-advogados-populares
 *
 * Traz as marcas do original: negrito, sublinhado, destaque e links. As fotos
 * do post foram baixadas para `public/img/carta-xxx` em WebP, com a legenda.
 *
 * Gerado por `scripts/gerar-carta-xxx.mjs` a partir da API do blog.
 * Não editar à mão.
 */
export type TrechoCarta = {
  texto: string;
  negrito?: boolean;
  sublinhado?: boolean;
  destaque?: boolean;
  link?: string;
};

export type BlocoCarta =
  | { tipo: "paragrafo" | "citacao"; runs: TrechoCarta[] }
  | { tipo: "imagem"; arquivo: string; legenda: string };

export const cartaXXX: BlocoCarta[] = [
  {
    tipo: "paragrafo",
    runs: [
        { texto: "O 30º Encontro Nacional se deu em João Pessoa / Paraíba reunindo centenas de advogadas/os populares, pesquisadores e estudantes." },
        { texto: "\n" },
    ],
  },
  {
    tipo: "imagem",
    arquivo: "/img/carta-xxx/carta-01.webp",
    legenda:
      "Abertura na OAB Paraíba com RENAP, IPDMS e RENAJU. Créditos: Comunicação IPDMS",
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Entre os dias 11 e 14 de novembro de 2026, nós, integrantes da assessoria jurídica popular, estudantes de direito, militantes de movimentos e organizações populares de todo o Brasil, " },
        { texto: "nos reunimos em João Pessoa, na Paraíba, para o XXX Encontro Nacional da Rede Nacional de Advogadas e Advogados Populares, a RENAP. O evento se deu em reunião com o 11º Seminário Nacional do Instituto de Pesquisa, Direitos e Movimentos Sociais (IPDMS) e o 20° Encontro Nacional da Rede Nacional de Assessoria Jurídica Universitária (RENAJU)", destaque: true },
        { texto: ", marcando inclusive a rearticulação desta última. " },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "O encontro foi espaço de intensos debates sobre a conjuntura brasileira e internacional, os desafios que se apresentam após o período eleitoral e as estratégias e compromissos da advocacia popular para o próximo ciclo de lutas. " },
        { texto: "Foram quatro dias de diálogos, reflexões e construção coletiva, reafirmando nosso compromisso com as lutas populares, a justiça socioambiental e racial e a democratização do acesso à Justiça.", destaque: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Abrimos os caminhos do Encontro com um ritual conduzido pelo povo indígena Tabajara que, com a força de sua ancestralidade, nos lembrou que nenhuma luta começa em nós: caminhamos sobre os passos de quem veio antes e ao lado de tantas gentes que seguem resistindo conosco. " },
    ],
  },
  {
    tipo: "imagem",
    arquivo: "/img/carta-xxx/carta-02.webp",
    legenda:
      "Abertura na OAB. Créditos: ASCOM OAB",
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "É essa força coletiva, que atravessa gerações e se manifesta nas trincheiras cotidianas da luta popular, que nos inspira a reconhecer e homenagear aquelas e aqueles que dedicam suas vidas à construção de um mundo mais justo. " },
        { texto: "Neste encontro, prestamos nossa homenagem a Lenir Correia, presa política em Rondônia por sua atuação junto aos camponeses, por colocar sua prática jurídica a serviço da luta pela terra e dos direitos do povo. ", destaque: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "O segundo dia do Encontro marcou 1 ano de sua prisão, que representa mais um grave episódio de criminalização da advocacia popular e de perseguição a quem ousa se posicionar frente aos interesses dos poderosos. Não aceitaremos que o exercício da advocacia comprometida com as lutas populares seja tratado como crime. " },
        { texto: "Exigimos a liberdade de Lenir Correia!", negrito: true, sublinhado: true, link: "https://www.abrapo.org/site/2026/11/11/1-ano-de-prisao-da-dra-lenir-correia-coelho-advogar-para-camponeses-nao-e-crime/" },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Compreendemos que vamos enfrentar um Congresso Nacional ainda mais reacionário e dominado pela extrema direita, que transforma sua força política em instrumento de ataque aos direitos dos povos e às conquistas históricas dos movimentos populares. " },
    ],
  },
  {
    tipo: "citacao",
    runs: [
        { texto: "Avançam iniciativas de flexibilização da legislação ambiental, precarização das relações de trabalho, enfraquecimento das políticas de ações afirmativas e retrocessos nos direitos das mulheres, assim como a criminalização de movimentos sociais e organizações da sociedade civil, e fragilização dos mecanismos de proteção aos defensores de direitos humanos. São também forças que se elegeram alimentando o ódio, a intolerância e a violência contra a população LGBTQIA+, os povos indígenas, quilombolas, comunidades tradicionais e tantos outros sujeitos historicamente marginalizados. Não se trata de episódios isolados, mas de um projeto político que busca aprofundar as desigualdades, preservar privilégios e impedir que o povo avance na conquista de direitos." },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "No cenário internacional, assistimos ao aprofundamento das disputas geopolíticas e à crise de hegemonia dos Estados Unidos que, diante do desgaste de sua posição no mundo, intensifica suas ofensivas para preservar seus interesses econômicos, políticos e militares. Um império em declínio que busca reiterar sua dominação por meio da guerra, da intervenção, das sanções e da pressão sobre os povos e territórios, com avanço especialmente na América Latina, causando interferências diretas na vida dos povos e comunidades latino-americanas. " },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "A escalada da violência, a ofensiva contra a soberania dos povos e a continuidade de projetos coloniais e predatórios demonstram que a crise do modelo de dominação capitalista não significa, por si só, a superação de suas estruturas de exploração. Acompanhamos, com preocupação, o avanço de uma nova agenda desenvolvimentista que reinaugura a acumulação capitalista sob o discurso da transição e da sustentabilidade, à revelia dos direitos das gentes. ", destaque: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Da mesma forma, com indignação, denunciamos os ataques sistemáticos à dignidade humana, aos territórios e à soberania dos povos, evidenciado pelo genocídio em curso na Palestina e um mundo silente com as condições a que esta sujeito o povo palestino com as violências praticadas pelo Estado de Israel; pela invasão da Venezuela e a interferência em seus espaços decisórios, em prol dos interesses dos Estados Unidos; e pelas sanções arbitrárias impostas à Cuba e as ameaças de invasão armada de seu território. " },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Ainda, sem perder de vista as novas disputas climáticas enfrentadas pela advocacia popular, é preciso recordar que a nossa luta é a mesma: não há justiça climática em territórios violentamente ocupados pelas forças do imperialismo. " },
        { texto: "No Brasil e no mundo, queremos territórios soberanos. Palestina livre! Cuba Livre! Venezuela Livre!", negrito: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Mas a conjuntura também é feita de resistência, organização e possibilidades de transformação. A mobilização popular e a vitória do presidente Lula demonstraram que a extrema direita não detém o monopólio do futuro e que a força das ruas, a organização coletiva e a luta revolucionária seguem capazes de alterar os rumos da história." },
        { texto: " A RENAP é resultado da luta histórica dos movimentos populares, e sendo assim construiu o levante do segundo turno com brigadas jurídicas populares, protocolos de segurança, grupos de fiscalização e se envolveu enquanto rede a fim de apoiar a luta do povo brasileiro. ", destaque: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Em um cenário global marcado pelo avanço autoritário, o povo Brasileiro representou uma esperança para aqueles que resistem à extrema direita e lutam por justiça social. Essa esperança, entretanto, não se sustenta apenas nas instituições ou nas disputas eleitorais, ela nasce da capacidade de mobilização popular, da solidariedade entre os povos e da construção cotidiana de alternativas ao modelo de exploração e opressão que nos é imposto. " },
        { texto: "É nas ruas, nos territórios e nas lutas coletivas que se disputa o futuro.", negrito: true },
    ],
  },
  {
    tipo: "imagem",
    arquivo: "/img/carta-xxx/carta-03.webp",
    legenda:
      "Mesa de Encerramento do Encontrão. Créditos: FIAN Brasil",
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Diante disso, reafirmamos o papel da RENAP enquanto articulação descentralizada, não-hierárquica e de abrangência nacional que reúne profissionais do direito, bacharéis e estudantes comprometidos com a assessoria jurídica aos movimentos sociais, e que não se furta à tarefa histórica de disputar o projeto de futuro de nossa sociedade. ", destaque: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Caminhamos ao lado e conjuntamente aos povos em luta, reconhecendo o Direito como campo de disputa política, em que" },
        { texto: " nossa atuação deve estar comprometida com a organização popular, a defesa dos territórios e a transformação das estruturas que sustentam desigualdades. ", negrito: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Nesse sentido, estamos " },
        { texto: "atentos aos debates sobre o judiciário e sua reforma, tema de interesse de todo o povo brasileiro, que deve ser disputado para que tenha como base fundamental o princípio da democratização do Acesso à Justiça e do dever de que o judiciário seja composto por todas as gentes.", destaque: true },
        { texto: " Seguiremos fazendo da advocacia um instrumento de resistência, solidariedade e construção de um futuro em que a justiça social e a dignidade não sejam privilégios, mas direitos de todas e todos. " },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Nos espaços de discussão do Encontro em João Pessoa, olhamos em volta e percebemos a força da juventude que é construída nas universidades e territórios e passa a compor a Rede. Reconhecemos a importância das novas gerações que pisam o chão da advocacia popular, sem perder de vista a história daqueles que trilharam os caminhos até aqui. " },
    ],
  },
  {
    tipo: "imagem",
    arquivo: "/img/carta-xxx/carta-04.webp",
    legenda:
      "",
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Assumimos, portanto, a tarefa de seguir. " },
        { texto: "Continuaremos construindo esta rede que sustenta quedas e que permite sonhar um futuro onde correm rios vivos e cabem as gentes em seus espaços - nas cidades e no campo, do meio às beiras. Esse futuro é possível e é traçado pelos movimentos sociais, pelos povos, e pelos advogados e advogadas populares cujos trabalhos e vidas se entrelaçam nessa matéria prima concreta que é o sonho. ", negrito: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Na retaguarda da vanguarda, retornamos aos nossos territórios com a certeza de que não trilhamos caminhos solitários. A RENAP, em seu 30° Encontro Nacional, rememora o passado da Rede com o respeito e o compromisso de quem pretende seguir. Nos reunimos para traçar os planos que permitem que se trate de uma tarefa possível. " },
        { texto: "E é esta carta, também, parte da memória para os trinta mais encontros que hão de vir. ", negrito: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "Lenir, Livre! Advocacia popular não é crime!", negrito: true },
    ],
  },
  {
    tipo: "paragrafo",
    runs: [
        { texto: "João Pessoa/PB, 14 de Novembro de 2026", negrito: true },
    ],
  },
  {
    tipo: "imagem",
    arquivo: "/img/carta-xxx/carta-05.webp",
    legenda:
      "Nota assinada pela RENAP, IPDMS e RENAJU em apoio a liberdade de Lenir Correia.",
  },
];

/** Link da publicação original, para quem quiser ler no site da RENAP. */
export const cartaXXXUrl =
  "https://www.renap.org.br/post/carta-politica-do-xxx-encontro-nacional-da-rede-nacional-de-advogadas-e-advogados-populares";
