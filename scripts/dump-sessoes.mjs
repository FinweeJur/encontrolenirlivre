/**
 * Escreve, em `.cache/`, as listas que os geradores em Python precisam.
 *
 * - `sessoes.json`: todas as atividades, com dia, hora, local e organização.
 * - `locais.json`: a tabela de lugares e o nome que vai na busca do mapa.
 *
 * É arquivo de trabalho, não vai para o site: `public/dados` foi retirado de
 * propósito, para não deixar dado solto na rede.
 */
import { build } from "esbuild";
import { Buffer } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";

const carregar = async (entrada) => {
  const saida = await build({
    entryPoints: [entrada],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    write: false,
    logLevel: "silent",
  });

  return import(
    "data:text/javascript;base64," + Buffer.from(saida.outputFiles[0].text).toString("base64")
  );
};

const sessoesMod = await carregar("src/content/sessoes.ts");
const locaisMod = await carregar("src/content/locais.ts");

mkdirSync(".cache", { recursive: true });

writeFileSync(".cache/sessoes.json", JSON.stringify(sessoesMod.sessoes, null, 2), "utf8");
writeFileSync(".cache/locais.json", JSON.stringify(locaisMod.LOCAIS, null, 2), "utf8");

console.log(
  `sessoes.json: ${sessoesMod.sessoes.length} atividades · locais.json: ${locaisMod.LOCAIS.length} lugares`,
);
