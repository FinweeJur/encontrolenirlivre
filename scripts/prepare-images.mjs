/**
 * Prepara as imagens do site: galeria, banner, retrato e logo.
 * Fontes: fotos do acervo RENAP (zip e pasta Downloads) + logo oficial.
 * Saída em public/img, sempre WebP/PNG otimizados.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/img");
const TMP = "C:/Users/teste/AppData/Local/Temp/opencode/renap-assets";
const DL = "C:/Users/teste/Downloads";
const ZIP = TMP;

const gallery = [
  ["IMG_3871.jpg", ZIP],
  ["IMG_3943.jpg", ZIP],
  ["IMG_8448-2.jpg", DL],
  ["IMG_8489-2.jpg", DL],
  ["IMG_8498-2.jpg", DL],
  ["IMG_8933-2.jpg", DL],
  ["IMG_8961-2.jpg", DL],
  ["IMG_8968-2.jpg", DL],
  ["IMG_9255-2.jpg", DL],
  ["IMG_9314-2.jpg", DL],
  ["IMG_9343-2.jpg", DL],
  ["IMG_9750-2.jpg", DL],
  ["IMG_7317.jpg", DL],
  ["IMG_7264 (1).jpg", DL],
  ["DSC_2040.jpg", DL],
];

const BG_DARK = { r: 20, g: 17, b: 13, alpha: 1 };
const BG_LIGHT = { r: 233, g: 223, b: 198, alpha: 1 };

await mkdir(path.join(OUT, "gallery"), { recursive: true });

let i = 1;
for (const [file, dir] of gallery) {
  const src = path.join(dir, file);
  const dest = path.join(OUT, "gallery", `${String(i).padStart(2, "0")}.webp`);
  await sharp(src)
    .rotate()
    .resize({ width: 1100, height: 760, fit: "cover", position: "attention" })
    .modulate({ saturation: 0.92 })
    .webp({ quality: 78, effort: 5 })
    .toFile(dest);
  console.log("gallery", i, file);
  i += 1;
}

// Banner largo do encontro
await sharp(path.join(TMP, "hero-banner.png"))
  .resize({ width: 1600 })
  .webp({ quality: 80 })
  .toFile(path.join(OUT, "banner.webp"));

// Retrato recortado, composto nas duas cores de fundo
const cutout = path.join(TMP, "lenir-cutout.png");
const portrait = sharp(cutout).resize({ width: 1000 });
const meta = await sharp(cutout).metadata();
const pw = 1000;
const ph = Math.round((meta.height / meta.width) * pw);
for (const [name, bg] of [
  ["portrait-dark.webp", BG_DARK],
  ["portrait-light.webp", BG_LIGHT],
]) {
  await sharp({
    create: { width: pw, height: ph, channels: 4, background: bg },
  })
    .composite([{ input: await portrait.png().toBuffer(), top: 0, left: 0 }])
    .webp({ quality: 88 })
    .toFile(path.join(OUT, name));
}

// Logo: branco e tinta, a partir do canal alfa
const logo = sharp(path.join(TMP, "logo-renap.png")).trim({ threshold: 1 });
const logoBuf = await logo.png().toBuffer();
const logoMeta = await sharp(logoBuf).metadata();
const lw = 900;
const lh = Math.round((logoMeta.height / logoMeta.width) * lw);
for (const [name, rgb] of [
  ["logo-white.png", { r: 244, g: 237, b: 224 }],
  ["logo-ink.png", { r: 42, g: 37, b: 33 }],
]) {
  const alpha = await sharp(logoBuf).resize({ width: lw }).ensureAlpha().extractChannel("alpha").toBuffer();
  await sharp({ create: { width: lw, height: lh, channels: 3, background: rgb } })
    .joinChannel(alpha)
    .png()
    .toFile(path.join(OUT, name));
}

// Favicon: logo sobre quadrado escuro
await sharp({ create: { width: 512, height: 512, channels: 4, background: { ...BG_DARK, alpha: 1 } } })
  .composite([{ input: await sharp(logoBuf).resize({ width: 380 }).png().toBuffer(), gravity: "center" }])
  .png()
  .toFile(path.join(OUT, "favicon.png"));

// OG: banner recortado
await sharp(path.join(TMP, "hero-banner.png"))
  .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
  .jpeg({ quality: 86 })
  .toFile(path.join(OUT, "og.jpg"));

console.log("ok");
