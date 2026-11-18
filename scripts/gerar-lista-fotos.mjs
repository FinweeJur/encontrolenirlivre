/**
 * Gera a lista das fotos do XXX Encontro a partir da pasta pública.
 * Rodar depois de `scripts/preparar-fotos-encontro.mjs`.
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PASTA = path.resolve("public/img/encontro-2026");
const SAIDA = path.resolve("src/content/fotosEncontro.ts");

const arquivos = (await readdir(PASTA))
  .filter((nome) => nome.endsWith(".webp"))
  .sort();

const lista = arquivos.map((nome) => `  "/img/encontro-2026/${nome}",`).join("\n");

const conteudo = `/**
 * Fotos do XXX Encontro Nacional da RENAP, em João Pessoa (11 a 14/11/2026).
 *
 * Fonte: acervo da organização — 43 fotos da pasta do encontro e uma amostra
 * do ZIP "Abertura OAB PB". Reduzidas para 900 px e convertidas em WebP por
 * \`scripts/preparar-fotos-encontro.mjs\`.
 *
 * A lista é gerada por \`scripts/gerar-lista-fotos.mjs\`: não editar à mão.
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
