/**
 * Gera `src/content/cartaXXX.ts` a partir do post oficial no blog da RENAP.
 *
 * Por que busca na API em vez de ler um arquivo intermediário: o PowerShell
 * 5.1 decodifica `application/json` sem charset como latin-1, e o texto saía
 * com "Ã­" no lugar de "í". O `fetch` do Node lê UTF-8 de verdade.
 *
 * Credenciais: `~/.config/renap/wix.json` (api_key, site_id). Nunca imprimir.
 *
 * Uso: node scripts/gerar-carta-xxx.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const CRED = path.join(os.homedir(), ".config", "renap", "wix.json");
const SAIDA = path.resolve("src/content/cartaXXX.ts");
const TITULO = /^Carta Pol.tica do XXX/i;
const URL_POST =
  "https://www.renap.org.br/post/carta-politica-do-xxx-encontro-nacional-da-rede-nacional-de-advogadas-e-advogados-populares";

const brutoCred = await readFile(CRED, "utf8");
// O arquivo de credenciais pode ter BOM: tira antes do JSON.parse.
const cred = JSON.parse(brutoCred.replace(/^\uFEFF/, ""));
const cabecalhos = {
  authorization: cred.api_key,
  "wix-site-id": cred.site_id,
  "content-type": "application/json",
};

const lista = await fetch("https://www.wixapis.com/blog/v3/posts?paging.limit=100", {
  headers: cabecalhos,
}).then((r) => r.json());

const alvo = (lista.posts || []).find((post) => TITULO.test(post.title));
if (!alvo) throw new Error("Não achei a Carta Política do XXX na lista de posts.");

const detalhe = await fetch(
  `https://www.wixapis.com/blog/v3/posts/${alvo.id}?fieldsets=RICH_CONTENT`,
  { headers: cabecalhos },
).then((r) => r.json());

function textoDosNos(nos) {
  let texto = "";
  for (const no of nos || []) {
    if (no.textData?.text) texto += no.textData.text;
    if (no.nodes?.length) texto += textoDosNos(no.nodes);
  }
  return texto;
}

const blocos = [];
for (const no of detalhe.post.richContent.nodes) {
  if (no.type === "IMAGE") continue;
  const texto = textoDosNos([no]).trim();
  if (!texto) continue;
  blocos.push({ tipo: no.type === "BLOCKQUOTE" ? "citacao" : "paragrafo", texto });
}

const corpo = blocos
  .map(
    (bloco) =>
      `  {\n    tipo: "${bloco.tipo}",\n    texto:\n      ${JSON.stringify(bloco.texto)},\n  },`,
  )
  .join("\n");

const conteudo = `/**
 * Carta Política do XXX Encontro Nacional da RENAP (João Pessoa, 2026).
 *
 * Texto integral publicado pela própria RENAP no blog oficial:
 * ${URL_POST}
 *
 * Gerado por \`scripts/gerar-carta-xxx.mjs\` a partir da API do blog.
 * Não editar à mão.
 */
export type BlocoCarta = { tipo: "paragrafo" | "citacao"; texto: string };

export const cartaXXX: BlocoCarta[] = [
${corpo}
];

/** Link da publicação original, para quem quiser ler no site da RENAP. */
export const cartaXXXUrl =
  "${URL_POST}";
`;

await writeFile(SAIDA, conteudo, "utf8");
console.log(`cartaXXX.ts: ${blocos.length} blocos · ${conteudo.length} caracteres`);
