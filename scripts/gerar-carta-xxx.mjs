/**
 * Gera `src/content/cartaXXX.ts` e baixa as imagens do post oficial.
 *
 * O post da RENAP tem negrito, sublinhado, destaque (marca-texto), links e
 * fotos com legenda. Este script traz tudo isso para o site, em vez de só o
 * texto corrido: cada parágrafo vira uma lista de trechos com as marcas, e
 * cada imagem é baixada para `public/img/carta-xxx` em WebP.
 *
 * Por que busca na API em vez de ler um arquivo intermediário: o PowerShell
 * 5.1 decodifica `application/json` sem charset como latin-1, e o texto saía
 * com "Ã­" no lugar de "í". O `fetch` do Node lê UTF-8 de verdade.
 *
 * Credenciais: `~/.config/renap/wix.json` (api_key, site_id). Nunca imprimir.
 *
 * Uso: node scripts/gerar-carta-xxx.mjs
 */
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const CRED = path.join(os.homedir(), ".config", "renap", "wix.json");
const SAIDA = path.resolve("src/content/cartaXXX.ts");
const PASTA_IMG = path.resolve("public/img/carta-xxx");
const TITULO = /^Carta Pol.tica do XXX/i;
const URL_POST =
  "https://www.renap.org.br/post/carta-politica-do-xxx-encontro-nacional-da-rede-nacional-de-advogadas-e-advogados-populares";

const cred = JSON.parse((await readFile(CRED, "utf8")).replace(/^\uFEFF/, ""));
const cabecalhos = { authorization: cred.api_key, "wix-site-id": cred.site_id };

const lista = await fetch("https://www.wixapis.com/blog/v3/posts?paging.limit=100", {
  headers: cabecalhos,
}).then((r) => r.json());

const alvo = (lista.posts || []).find((post) => TITULO.test(post.title));
if (!alvo) throw new Error("Não achei a Carta Política do XXX na lista de posts.");

const detalhe = await fetch(
  `https://www.wixapis.com/blog/v3/posts/${alvo.id}?fieldsets=RICH_CONTENT`,
  { headers: cabecalhos },
).then((r) => r.json());

/** Junta os trechos de um nó em "runs" com as marcas que interessam ao site. */
function runsDe(nos) {
  const runs = [];
  for (const no of nos || []) {
    const texto = no.textData?.text;
    if (texto) {
      const marcas = new Set((no.textData.decorations || []).map((d) => d.type));
      const link = (no.textData.decorations || []).find((d) => d.type === "LINK");
      runs.push({
        texto,
        negrito: marcas.has("BOLD") || undefined,
        sublinhado: marcas.has("UNDERLINE") || undefined,
        destaque: marcas.has("SKETCH") || undefined,
        link: link?.linkData?.link?.url || undefined,
      });
    }
    if (no.nodes?.length) runs.push(...runsDe(no.nodes));
  }
  return runs;
}

function textoDe(nos) {
  return runsDe(nos)
    .map((run) => run.texto)
    .join("");
}

const blocos = [];
const imagens = [];

for (const no of detalhe.post.richContent.nodes) {
  if (no.type === "IMAGE" && no.imageData?.image?.src?.id) {
    const indice = imagens.length + 1;
    const nome = `carta-${String(indice).padStart(2, "0")}.webp`;
    imagens.push({
      id: no.imageData.image.src.id,
      arquivo: `/img/carta-xxx/${nome}`,
      destino: path.join(PASTA_IMG, nome),
      legenda: no.imageData.caption || no.nodes?.flatMap((n) => runsDe([n]))?.map((r) => r.texto).join(" ") || "",
    });
    blocos.push({ tipo: "imagem", indice });
    continue;
  }

  const runs = runsDe(no.nodes);
  const texto = runs.map((r) => r.texto).join("").trim();
  if (!texto) continue;
  blocos.push({ tipo: no.type === "BLOCKQUOTE" ? "citacao" : "paragrafo", runs });
}

await mkdir(PASTA_IMG, { recursive: true });
let baixadas = 0;
for (const imagem of imagens) {
  const url = `https://static.wixstatic.com/media/${imagem.id}`;
  const resposta = await fetch(url);
  if (!resposta.ok) {
    console.warn(`imagem falhou (${resposta.status}): ${url}`);
    continue;
  }
  const bytes = Buffer.from(await resposta.arrayBuffer());
  await sharp(bytes).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 82 }).toFile(imagem.destino);
  baixadas += 1;
}

const serializarRuns = (runs) =>
  runs
    .map((run) => {
      const partes = [`texto: ${JSON.stringify(run.texto)}`];
      if (run.negrito) partes.push("negrito: true");
      if (run.sublinhado) partes.push("sublinhado: true");
      if (run.destaque) partes.push("destaque: true");
      if (run.link) partes.push(`link: ${JSON.stringify(run.link)}`);
      return `        { ${partes.join(", ")} },`;
    })
    .join("\n");

const corpo = blocos
  .map((bloco) => {
    if (bloco.tipo === "imagem") {
      const imagem = imagens[bloco.indice - 1];
      return `  {\n    tipo: "imagem",\n    arquivo: ${JSON.stringify(imagem.arquivo)},\n    legenda:\n      ${JSON.stringify(imagem.legenda.trim())},\n  },`;
    }
    return `  {\n    tipo: "${bloco.tipo}",\n    runs: [\n${serializarRuns(bloco.runs)}\n    ],\n  },`;
  })
  .join("\n");

const conteudo = `/**
 * Carta Política do XXX Encontro Nacional da RENAP (João Pessoa, 2026).
 *
 * Texto integral publicado pela própria RENAP no blog oficial:
 * ${URL_POST}
 *
 * Traz as marcas do original: negrito, sublinhado, destaque e links. As fotos
 * do post foram baixadas para \`public/img/carta-xxx\` em WebP, com a legenda.
 *
 * Gerado por \`scripts/gerar-carta-xxx.mjs\` a partir da API do blog.
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
${corpo}
];

/** Link da publicação original, para quem quiser ler no site da RENAP. */
export const cartaXXXUrl =
  "${URL_POST}";
`;

await writeFile(SAIDA, conteudo, "utf8");
console.log(
  `cartaXXX.ts: ${blocos.length} blocos · ${imagens.length} imagens (${baixadas} baixadas) · ${conteudo.length} caracteres`,
);
