/**
 * Prepara as logos do IPDMS e da RENAJU como ladrilhos quadrados.
 *
 * Por que: a grade do Infinite Drift 2 recorta cada imagem em quadrado. Logo
 * larga com fundo transparente seria cortada e mostraria o fundo da grade.
 * Aqui ela vira um cartão 900x900 em papel creme, com a logo centralizada.
 */
import sharp from "sharp";
import path from "node:path";

const PAPEL = "#f6efdf";
const LADO = 900;
const DESENHO = 620;

const logos = [
  ["public/img/ipdms-logo.png", "public/img/encontro-2026/logo-ipdms.webp"],
  ["public/img/renaju-logo.png", "public/img/encontro-2026/logo-renaju.webp"],
];

for (const [origem, destino] of logos) {
  const desenho = await sharp(origem)
    .resize({ width: DESENHO, height: DESENHO, fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();

  await sharp({
    create: { width: LADO, height: LADO, channels: 4, background: PAPEL },
  })
    .composite([{ input: desenho, gravity: "center" }])
    .webp({ quality: 88 })
    .toFile(path.resolve(destino));

  console.log(`${destino} pronto`);
}
