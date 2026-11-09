/**
 * Escreve a lista de atividades em `.cache/sessoes.json` para os geradores
 * que não falam TypeScript (o dos QR codes, em Python).
 *
 * É arquivo de trabalho, não vai para o site: `public/dados` foi retirado de
 * propósito, para não deixar dado solto na rede.
 */
import { build } from "esbuild";
import { Buffer } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";

const saida = await build({
  entryPoints: ["src/content/sessoes.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  write: false,
  logLevel: "silent",
});

const modulo = await import(
  "data:text/javascript;base64," + Buffer.from(saida.outputFiles[0].text).toString("base64")
);

mkdirSync(".cache", { recursive: true });
writeFileSync(".cache/sessoes.json", JSON.stringify(modulo.sessoes, null, 2), "utf8");
console.log(`sessoes.json: ${modulo.sessoes.length} atividades`);
