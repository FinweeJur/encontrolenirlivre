/**
 * Prepara as fotos do XXX Encontro (João Pessoa, 2026) para o site.
 *
 * Fontes: as fotos da pasta do encontro (raiz, sem a subpasta de logos) e uma
 * amostra do ZIP. Saída em `public/img/encontro-2026`, WebP 900x675.
 *
 * Regras:
 * - fotos repetidas (mesmo tamanho e mesmo começo de arquivo) entram uma vez;
 * - a subpasta `LOGOS RENAP` fica de fora: aquilo é marca, não foto;
 * - o corte 4:3 usa a área de maior atenção da imagem, para rostos e grupos
 *   ficarem centrados no ladrilho.
 *
 * Rodar: node scripts/preparar-fotos-encontro.mjs
 */
import sharp from "sharp";
import { mkdir, open, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
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

/** Só as fotos: fora a subpasta de logos e a pasta dos vídeos comprimidos. */
function soFotos(arquivos, raiz) {
  const base = path.resolve(raiz);
  return arquivos.filter((caminho) => {
    const partes = path.relative(base, path.resolve(caminho)).split(path.sep);
    const subpasta = partes.slice(0, -1);
    return !subpasta.includes("comprimidos") && !subpasta.includes("LOGOS RENAP");
  });
}

const doPc = soFotos(await listar(PASTA_PC), PASTA_PC);
const doZip = await listar(ZIP);

// Amostra espalhada do ZIP: pega de N em N para não ficar tudo do mesmo momento.
const passo = Math.max(1, Math.floor(doZip.length / LIMITE_ZIP));
const amostra = doZip.filter((_, i) => i % passo === 0).slice(0, LIMITE_ZIP);

const todas = [...doPc, ...amostra];
await mkdir(OUT, { recursive: true });

/**
 * Impressão digital do arquivo: tamanho + hash dos primeiros 64 KB.
 * Serve para não repetir a mesma foto duas vezes (a pasta tinha pares
 * "IMG_1234.jpg" e "IMG_1234 (1).jpg").
 */
async function digital(caminho) {
  const info = await stat(caminho);
  const arquivo = await open(caminho, "r");
  const pedaco = Buffer.alloc(65536);
  try {
    await arquivo.read(pedaco, 0, pedaco.length, 0);
  } finally {
    await arquivo.close();
  }
  return `${info.size}:${createHash("sha1").update(pedaco).digest("hex")}`;
}

const vistos = new Set();
let total = 0;
let indice = 0;
let repetidas = 0;

for (const origem of todas) {
  const chave = await digital(origem);
  if (vistos.has(chave)) {
    repetidas += 1;
    continue;
  }
  vistos.add(chave);

  indice += 1;
  const nome = `encontro-${String(indice).padStart(2, "0")}.webp`;
  const destino = path.join(OUT, nome);
  await sharp(origem)
    .rotate()
    .resize({
      width: LARGURA,
      height: ALTURA,
      fit: "cover",
      position: sharp.strategy.attention,
    })
    .webp({ quality: 78 })
    .toFile(destino);
  total += (await stat(destino)).size;
}

console.log(
  `fotos: ${vistos.size} (${repetidas} repetidas descartadas) · ` +
    `${(total / 1024 / 1024).toFixed(1)} MB · média ${Math.round(total / vistos.size / 1024)} KB`,
);
