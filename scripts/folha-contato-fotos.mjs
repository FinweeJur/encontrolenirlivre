/** Monta uma folha de contato 9x9 das fotos do encontro, para conferência visual. */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const PASTA = path.resolve("public/img/encontro-2026");
const SAIDA = path.resolve(".cache/folha-fotos.jpg");
const LADO = 160;
const COLUNAS = 9;

const arquivos = (await readdir(PASTA)).filter((n) => n.endsWith(".webp")).sort();

const camadas = [];
for (let i = 0; i < arquivos.length; i += 1) {
  const mini = await sharp(path.join(PASTA, arquivos[i]))
    .resize(LADO, LADO, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();
  camadas.push({
    input: mini,
    left: (i % COLUNAS) * LADO,
    top: Math.floor(i / COLUNAS) * LADO,
  });
}

const linhas = Math.ceil(arquivos.length / COLUNAS);

await sharp({
  create: {
    width: COLUNAS * LADO,
    height: linhas * LADO,
    channels: 3,
    background: "#111",
  },
})
  .composite(camadas)
  .jpeg({ quality: 82 })
  .toFile(SAIDA);

console.log(`${SAIDA}: ${arquivos.length} fotos, ${COLUNAS} colunas, ${linhas} linhas`);
