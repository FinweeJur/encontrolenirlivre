/**
 * Gera a lista das fotos do XXX Encontro a partir da pasta pÃºblica.
 * Rodar depois de `scripts/preparar-fotos-encontro.mjs`.
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PASTA = path.resolve("public/img/encontro-2026");
const SAIDA = path.resolve("src/content/fotosEncontro.ts");

/** Hash estÃ¡vel do nome: embaralha sem depender da plataforma. */
function assinatura(nome) {
  let valor = 0;
  for (const caractere of nome) valor = (valor * 31 + caractere.charCodeAt(0)) % 1_000_003;
  return valor;
}

const arquivos = (await readdir(PASTA))
  .filter((nome) => nome.endsWith(".webp"))
  // As logos são cartões à parte: entram só na grade do seminário.
  .filter((nome) => !nome.startsWith("logo-"))
  // Ordem embaralhada com semente fixa: em ordem de arquivo, fotos tiradas
  // seguidas (mesmo Ã¢ngulo, segundos depois) ficavam lado a lado e pareciam
  // repetiÃ§Ã£o na grade.
  .sort((a, b) => assinatura(a) - assinatura(b));

const lista = arquivos.map((nome) => `  "/img/encontro-2026/${nome}",`).join("\n");

const conteudo = `/**
 * Fotos do XXX Encontro Nacional da RENAP, em JoÃ£o Pessoa (11 a 14/11/2026).
 *
 * Fonte: acervo da organizaÃ§Ã£o â€” 43 fotos da pasta do encontro e uma amostra
 * do ZIP "Abertura OAB PB". Reduzidas para 900 px e convertidas em WebP por
 * \`scripts/preparar-fotos-encontro.mjs\`.
 *
 * A lista Ã© gerada por \`scripts/gerar-lista-fotos.mjs\`: nÃ£o editar Ã  mÃ£o.
 */
export const fotosEncontro: string[] = [
${lista}
];

/** Divide em N faixas, sem repetir foto dentro da mesma faixa. */
export function faixasDeFotos(quantidade: number): string[][] {
  const faixas: string[][] = Array.from({ length: quantidade }, () => []);
  fotosEncontro.forEach((foto, indice) => {
    faixas[indice % quantidade].push(foto);
  });
  return faixas;
}
`;

await writeFile(SAIDA, conteudo, "utf8");
console.log(`fotosEncontro.ts: ${arquivos.length} fotos`);
