/**
 * Prepara as fotos do XXX Encontro (João Pessoa, 2026) para o site.
 *
 * Fontes: as 43 fotos que já estão na pasta do encontro + uma amostra do ZIP.
 * Saída em `public/img/encontro-2026`, WebP com 900 px de largura.
 *
 * Rodar: node scripts/preparar-fotos-encontro.mjs
 */
import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const PASTA_PC = "C:/Users/teste/Downloads/LOGOS RENAP";
const ZIP = "C:/Users/teste/AppData/Local/Temp/opencode/encontro-zip";
const OUT = path.resolve("public/img/encontro-2026");
const LARGURA = 900;
const ALTURA = 675;
const LIMITE_ZIP = 34;

const ehImagem = (nome) => /\.(jpe?g|png|webp|heic|heif)$/i.test(nome);

async function listar(pasta) {
  const itens = await readdir(pasta, { withFileTypes: true });
  const arquivos = [];
  for (const item of itens) {
    const caminho = path.join(pasta, item.name);
    if (item.isDirectory()) arquivos.push(...(await listar(caminho)));
    else if (ehImagem(item.name)) arquivos.push(caminho);
  }
  return arquivos;
}

const doPc = (await listar(PASTA_PC)).filter((c) => !c.includes(path.sep + "comprimidos"));
const doZip = await listar(ZIP);

// Amostra espalhada do ZIP: pega de N em N para não ficar tudo do mesmo momento.
const passo = Math.max(1, Math.floor(doZip.length / LIMITE_ZIP));
const amostra = doZip.filter((_, i) => i % passo === 0).slice(0, LIMITE_ZIP);

const todas = [...doPc, ...amostra];
await mkdir(OUT, { recursive: true });

let total = 0;
let indice = 0;
for (const origem of todas) {
  indice += 1;
  const nome = `encontro-${String(indice).padStart(2, "0")}.webp`;
  const destino = path.join(OUT, nome);
  await sharp(origem)
    .rotate()
    // Corte 4:3 na área de maior "atenção" da imagem (rostos e gente, quase
    // sempre), para a foto já sair centrada no assunto em vez de no meio
    // geométrico do arquivo.
    .resize({ width: LARGURA, height: ALTURA, fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: 78 })
    .toFile(destino);
  const info = await stat(destino);
  total += info.size;
}

console.log(`fotos: ${todas.length} · ${(total / 1024 / 1024).toFixed(1)} MB · média ${Math.round(total / todas.length / 1024)} KB`);
