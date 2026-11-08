/**
 * Gera a página de programação completa em HTML puro.
 *
 * Por que HTML e não JSON: JSON é contrato de máquina, não serve para ler no
 * celular nem imprimir na portaria. Esta página é o programa inteiro, em
 * arquivo único, sem JavaScript obrigatório e com estilo de impressão.
 *
 * Entra em `public/programa.html`, então responde em /programa.html nos dois
 * projetos (RENAP e Seminário), porque o build copia `public/`.
 *
 * Rodado no `npm run build`, antes do Vite copiar `public/`.
 */
import { build } from "esbuild";
import { Buffer } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";

const SAIDA = "public/programa.html";

const resultado = await build({
  entryPoints: ["src/content/programacaoDetalhada.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  write: false,
  logLevel: "silent",
});

const codigo = resultado.outputFiles[0].text;
const modulo = await import(
  "data:text/javascript;base64," + Buffer.from(codigo).toString("base64")
);

const dias = modulo.programaDetalhado;
if (!Array.isArray(dias) || dias.length === 0) {
  throw new Error("programacaoDetalhada não exportou dias");
}

const escapar = (texto) =>
  String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const SEMANA = {
  quarta: "quarta-feira",
  quinta: "quinta-feira",
  sexta: "sexta-feira",
  sábado: "sábado",
};

const total = dias.reduce((soma, d) => soma + d.itens.length, 0);
const hoje = new Date();

const blocos = dias
  .map((dia) => {
    const itens = dia.itens
      .map(
        (item) => `
        <li>
          <span class="hora">${escapar(item.hora)}</span>
          <span class="texto">
            <strong>${escapar(item.titulo)}</strong>
            ${item.local ? `<span class="local">${escapar(item.local)}</span>` : ""}
          </span>
          <span class="tag tag--${escapar(item.tag.toLowerCase())}">${escapar(item.tag)}</span>
        </li>`,
      )
      .join("");

    return `
      <section class="dia">
        <h2><span class="num">${escapar(dia.dia)}</span> ${escapar(SEMANA[dia.semana] ?? dia.semana)}</h2>
        <ol>${itens}</ol>
      </section>`;
  })
  .join("");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Programação completa — Encontrão RENAP · IPDMS · RENAJU 2026</title>
<meta name="description" content="Programação completa do 30º Encontro Nacional da RENAP, do XI Seminário do IPDMS e do 20º Encontro da RENAJU, de 11 a 14 de novembro de 2026, na UFPB.">
<meta name="robots" content="index,follow">
<link rel="icon" href="/img/favicon.png">
<style>
  :root {
    --tinta: #2a2521;
    --tinta-fraca: #6d6153;
    --linha: #d9ccb2;
    --papel: #f6f1e7;
    --vermelho: #bf2a26;
    --amarelo: #b8791a;
    --verde: #0a6f68;
    --azul: #3c5d86;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--papel);
    color: var(--tinta);
    font-family: "Satoshi", system-ui, -apple-system, "Segoe UI", sans-serif;
    line-height: 1.5;
  }
  .casca { max-width: 60rem; margin: 0 auto; padding: 2rem 1.2rem 3rem; }
  header { border-bottom: 3px solid var(--vermelho); padding-bottom: 1rem; margin-bottom: 1.6rem; }
  .olho {
    margin: 0 0 .4rem;
    font-family: ui-monospace, "SFMono-Regular", monospace;
    font-size: .68rem;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--vermelho);
  }
  h1 {
    margin: 0 0 .35rem;
    font-size: clamp(1.8rem, 6vw, 2.8rem);
    line-height: .95;
    letter-spacing: -.02em;
    text-transform: uppercase;
  }
  .sub { margin: 0; color: var(--tinta-fraca); }
  .meta { margin: .6rem 0 0; font-size: .8rem; color: var(--tinta-fraca); }
  .imprimir {
    margin-top: 1rem;
    padding: .5rem .9rem;
    border: 1px solid var(--vermelho);
    border-radius: 100px;
    background: transparent;
    color: var(--vermelho);
    font: inherit;
    font-size: .78rem;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .imprimir:hover { background: var(--vermelho); color: var(--papel); }
  .dia { margin: 0 0 1.8rem; }
  .dia h2 {
    display: flex;
    align-items: baseline;
    gap: .5rem;
    margin: 0 0 .6rem;
    padding-bottom: .35rem;
    border-bottom: 1px solid var(--linha);
    font-size: 1.05rem;
    letter-spacing: .02em;
    text-transform: uppercase;
  }
  .num {
    font-size: 1.6rem;
    line-height: 1;
    color: var(--vermelho);
    font-family: Georgia, serif;
  }
  ol { list-style: none; margin: 0; padding: 0; }
  li {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr) auto;
    gap: .3rem .9rem;
    align-items: baseline;
    padding: .5rem 0;
    border-bottom: 1px dotted var(--linha);
  }
  .hora {
    font-family: ui-monospace, "SFMono-Regular", monospace;
    font-size: .72rem;
    font-weight: 600;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: var(--tinta-fraca);
  }
  .texto strong { display: block; font-size: .92rem; font-weight: 600; }
  .local {
    display: block;
    margin-top: .12rem;
    font-size: .76rem;
    color: var(--tinta-fraca);
  }
  .tag {
    font-family: ui-monospace, "SFMono-Regular", monospace;
    font-size: .6rem;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
    padding: .1rem .45rem;
    border: 1px solid currentColor;
    border-radius: 100px;
    white-space: nowrap;
  }
  .tag--ipdms { color: var(--amarelo); }
  .tag--renap { color: var(--vermelho); }
  .tag--renaju { color: var(--verde); }
  .tag--conjunta { color: var(--tinta-fraca); }
  .tag--cultural { color: var(--azul); }
  footer {
    margin-top: 2rem;
    padding-top: .8rem;
    border-top: 1px solid var(--linha);
    font-size: .74rem;
    color: var(--tinta-fraca);
  }
  footer a { color: var(--vermelho); }
  @media (max-width: 560px) {
    li { grid-template-columns: 1fr auto; }
    .hora { grid-column: 1 / -1; }
    .texto { grid-column: 1; }
    .tag { grid-row: 2; }
  }
  @media print {
    :root { --tinta: #000; --tinta-fraca: #333; --linha: #bbb; --papel: #fff; }
    .casca { max-width: none; padding: 0; }
    .imprimir { display: none; }
    .dia { break-inside: avoid; }
    li { break-inside: avoid; }
    a { color: inherit; text-decoration: none; }
  }
</style>
</head>
<body>
<div class="casca">
  <header>
    <p class="olho">30º Encontro Nacional da RENAP · XI Seminário do IPDMS · 20º Encontro da RENAJU</p>
    <h1>Programação completa</h1>
    <p class="sub">11 a 14 de novembro de 2026 · UFPB, Campus I · João Pessoa/PB</p>
    <p class="meta">${total} atividades em ${dias.length} dias. Versão de ${escapar(
      hoje.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    )}.</p>
    <button class="imprimir" type="button" onclick="window.print()">Imprimir</button>
  </header>

  <main>${blocos}
  </main>

  <footer>
    <p>Programação sujeita a alteração pela organização. Salas e horários conferidos com o documento de 8 de novembro de 2026.</p>
    <p>Site do encontro: <a href="https://encontrolenirlivre.pages.dev">encontrolenirlivre.pages.dev</a> · Seminário: <a href="https://seminariovenasabiertas.pages.dev">seminariovenasabiertas.pages.dev</a></p>
  </footer>
</div>
</body>
</html>`;

mkdirSync("public", { recursive: true });
writeFileSync(SAIDA, html, "utf8");

console.log(`programa.html: ${dias.length} dias, ${total} atividades → ${SAIDA}`);
