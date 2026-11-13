/**
 * Gera a página de programação completa em HTML puro.
 *
 * Por que HTML e não JSON: JSON é contrato de máquina, não serve para ler no
 * celular nem imprimir na portaria. Esta página é o programa inteiro, em
 * arquivo único, sem JavaScript obrigatório e com estilo de impressão.
 *
 * Entra em `public/programa.html`, então responde em /programa nos dois
 * projetos (RENAP e Seminário), porque o build copia `public/`.
 *
 * A identidade visual é a mesma de /checkin e /lancamentos: Clash Display nos
 * títulos, General Sans no texto, Tabular nos dados, papel creme sobre fundo
 * escuro e botão de tema claro/escuro salvo em `ecnl-theme`. Antes a página
 * usava Georgia e uma paleta própria, e destoava do resto do site.
 *
 * Rodado no `npm run build`, antes do Vite copiar `public/`.
 */
import { build } from "esbuild";
import { Buffer } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";

const SAIDA = "public/programa.html";

const carregar = async (caminho) => {
  const saida = await build({
    entryPoints: [caminho],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    write: false,
    logLevel: "silent",
  });

  const codigo = saida.outputFiles[0].text;
  return import("data:text/javascript;base64," + Buffer.from(codigo).toString("base64"));
};

const modulo = await carregar("src/content/programacaoDetalhada.ts");
const locaisMod = await carregar("src/content/locais.ts");

const dias = modulo.programaDetalhado;
if (!Array.isArray(dias) || dias.length === 0) {
  throw new Error("programaDetalhado não exportou dias");
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

const atalhos = dias
  .map(
    (dia) =>
      `<a class="atalho" href="#dia-${escapar(dia.dia)}"><span>${escapar(
        dia.dia,
      )}/11</span> ${escapar(SEMANA[dia.semana] ?? dia.semana).replace("-feira", "")}</a>`,
  )
  .join("");

const blocos = dias
  .map((dia) => {
    const itens = dia.itens
      .map((item) => {
        const lugar = item.local ? locaisMod.acharLocal(item.local) : null;
        const mapa = lugar
          ? ` <a class="mapa" href="${escapar(
              locaisMod.linkOpenStreetMap(lugar),
            )}" target="_blank" rel="noopener noreferrer">mapa</a>`
          : "";
        const textoCopia = `${item.hora} — ${item.titulo}${item.local ? ` — ${item.local}` : ""}`;
        const linkMapa = lugar ? locaisMod.linkOpenStreetMap(lugar) : "";

        return `
        <li class="item">
          <span class="hora">${escapar(item.hora)}</span>
          <div class="texto">
            <strong class="titulo">${escapar(item.titulo)}</strong>
            ${item.local ? `<span class="local">${escapar(item.local)}${mapa}</span>` : ""}
            <span class="acoes">
              <button class="pequeno" type="button" data-copia="${escapar(textoCopia)}">Copiar</button>
              ${lugar ? `<button class="pequeno" type="button" data-link="${escapar(linkMapa)}">Link do mapa</button>` : ""}
            </span>
          </div>
          <span class="tag tag--${escapar(item.tag.toLowerCase())}">${escapar(item.tag)}</span>
        </li>`;
      })
      .join("");

    return `
      <section class="dia" id="dia-${escapar(dia.dia)}">
        <h2>
          <span class="num">${escapar(dia.dia)}</span>
          <span class="rotulo">${escapar(SEMANA[dia.semana] ?? dia.semana)} · novembro de 2026</span>
        </h2>
        <ol>${itens}</ol>
      </section>`;
  })
  .join("");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<script>try{var t=localStorage.getItem("ecnl-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark";}catch(e){}</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#14110d">
<title>Programação completa — Encontrão RENAP · IPDMS · RENAJU 2026</title>
<meta name="description" content="Programação completa do 30º Encontro Nacional da RENAP, do XI Seminário do IPDMS e do 20º Encontro da RENAJU, de 11 a 14 de novembro de 2026, na UFPB.">
<meta name="robots" content="index,follow">
<link rel="icon" href="/img/favicon.png">
<style>
  :root {
    --fundo: #0f0d0b;
    --papel: #f6efdf;
    --papel-2: #efe3cc;
    --tinta: #1a1613;
    --tinta-fraca: #5b5242;
    --linha: #d9cbb1;
    --vermelho: #b3261e;
    --amarelo: #e0a52a;
    --verde: #1e6b4f;
    --azul: #3c5d86;
  }
  html[data-theme="light"] {
    --fundo: #e9dfc6;
    --papel: #fffdf7;
    --papel-2: #f4ead6;
    --tinta: #2a2521;
    --tinta-fraca: #6d6153;
    --linha: #c2b193;
    --vermelho: #bf2a26;
    --amarelo: #b8791a;
    --verde: #1e6b4f;
    --azul: #33517a;
  }

  /* ---------- identidade do site ---------- */
  @font-face {
    font-family: "Clash Display";
    src: url("/fonts/ClashDisplay-Semibold.woff2") format("woff2");
    font-weight: 600;
    font-display: swap;
  }
  @font-face {
    font-family: "General Sans";
    src: url("/fonts/GeneralSans-Regular.woff2") format("woff2");
    font-weight: 400;
    font-display: swap;
  }
  @font-face {
    font-family: "General Sans";
    src: url("/fonts/GeneralSans-Semibold.woff2") format("woff2");
    font-weight: 600;
    font-display: swap;
  }
  @font-face {
    font-family: "Tabular";
    src: url("/fonts/Tabular-Semibold.woff2") format("woff2");
    font-weight: 600;
    font-display: swap;
  }

  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    padding: 18px 14px 46px;
    background: radial-gradient(circle at 10% 0%, #2a2118 0, transparent 42%), var(--fundo);
    color: var(--tinta);
    font-family: "General Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 1rem;
    line-height: 1.5;
  }
  html[data-theme="light"] body { background: var(--fundo); }

  .folha {
    max-width: 60rem;
    margin: 0 auto;
    background: var(--papel);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  }

  /* ---------- capa ---------- */
  header {
    position: relative;
    padding: 28px 22px 22px;
    background: linear-gradient(135deg, #1d1a14, #2b251c);
    color: #f7efdd;
  }
  .tema {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 1px solid #5a4d3c;
    background: #2b251c;
    color: #f7efdd;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }
  .tema:hover { border-color: var(--amarelo); color: var(--amarelo); }
  .olho {
    margin: 0 0 0.65rem;
    padding-right: 2.6rem;
    color: #d9cdb7;
    font-family: "Tabular", ui-monospace, "SFMono-Regular", monospace;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  h1 {
    margin: 0 0 0.5rem;
    font-family: "Clash Display", "Arial Narrow", system-ui, sans-serif;
    font-size: clamp(1.6rem, 5.4vw, 2.4rem);
    line-height: 1.05;
    letter-spacing: -0.01em;
  }
  .sub { margin: 0.2rem 0; color: #e6dbc6; font-size: 0.95rem; }
  .meta {
    margin: 0.2rem 0 0;
    color: #c9bda6;
    font-family: "Tabular", ui-monospace, "SFMono-Regular", monospace;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
  }
  .meta a { color: var(--amarelo); }

  .botoes { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.1rem; }
  .botao {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 2.75rem;
    padding: 0.55rem 0.9rem;
    border: 1px solid #5a4d3c;
    border-radius: 999px;
    background: transparent;
    color: #f7efdd;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }
  .botao:hover { border-color: var(--amarelo); color: var(--amarelo); }
  .botao--forte {
    border-color: var(--amarelo);
    background: var(--amarelo);
    color: #1a150e;
    font-weight: 700;
  }
  .botao--forte:hover { background: #f0b73d; color: #1a150e; }
  .botao--zap {
    border-color: #25d366;
    background: #25d366;
    color: #073b1b;
    font-weight: 700;
  }
  .botao--zap:hover { background: #4ade80; color: #073b1b; }
  .botao svg { width: 1rem; height: 1rem; fill: currentColor; }

  .atalhos {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 1rem;
    padding-top: 0.9rem;
    border-top: 1px solid #3b3228;
  }
  .atalho {
    display: inline-flex;
    align-items: baseline;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    border: 1px solid #4a4034;
    border-radius: 999px;
    color: #e6dbc6;
    font-size: 0.78rem;
    text-decoration: none;
  }
  .atalho span {
    font-family: "Tabular", ui-monospace, monospace;
    font-weight: 600;
  }
  .atalho:hover { border-color: var(--amarelo); color: var(--amarelo); }

  /* ---------- dias ---------- */
  main { padding: 20px; }
  .dia { margin: 0 0 1.9rem; scroll-margin-top: 1rem; }
  .dia h2 {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    margin: 0 0 0.5rem;
    padding-bottom: 0.4rem;
    border-bottom: 2px solid var(--vermelho);
  }
  .num {
    font-family: "Clash Display", "Arial Narrow", system-ui, sans-serif;
    font-size: 1.9rem;
    line-height: 0.9;
    color: var(--vermelho);
  }
  .rotulo {
    font-family: "Tabular", ui-monospace, "SFMono-Regular", monospace;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--tinta-fraca);
  }
  ol { list-style: none; margin: 0; padding: 0; }
  .item {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr) auto;
    gap: 0.35rem 1rem;
    align-items: baseline;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--linha);
  }
  .item:last-child { border-bottom: 0; }
  .hora {
    font-family: "Tabular", ui-monospace, "SFMono-Regular", monospace;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--vermelho);
  }
  .titulo {
    display: block;
    font-size: 0.98rem;
    font-weight: 600;
    line-height: 1.3;
  }
  .local {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.85rem;
    color: var(--tinta-fraca);
  }
  .mapa {
    margin-left: 0.35rem;
    font-family: "Tabular", ui-monospace, monospace;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--vermelho);
    border-bottom: 1px solid currentColor;
  }
  .acoes { display: inline-flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem; }
  .pequeno {
    padding: 0.15rem 0.6rem;
    border: 1px solid var(--linha);
    border-radius: 999px;
    background: transparent;
    color: var(--tinta-fraca);
    font: inherit;
    font-size: 0.75rem;
    letter-spacing: 0.03em;
    cursor: pointer;
  }
  .pequeno:hover { border-color: var(--vermelho); color: var(--vermelho); }
  .tag {
    justify-self: end;
    padding: 0.1rem 0.5rem;
    border: 1px solid currentColor;
    border-radius: 999px;
    font-family: "Tabular", ui-monospace, monospace;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .tag--ipdms { color: var(--amarelo); }
  .tag--renap { color: var(--vermelho); }
  .tag--renaju { color: var(--verde); }
  .tag--conjunta { color: var(--tinta-fraca); }
  .tag--cultural { color: var(--azul); }

  footer {
    padding: 18px 20px 22px;
    background: linear-gradient(135deg, #1d1a14, #2b251c);
    color: #c9bda6;
    font-size: 0.8rem;
  }
  footer p { margin: 0.2rem 0; }
  footer a { color: var(--amarelo); }

  @media (max-width: 560px) {
    body { padding: 10px 8px 34px; }
    .folha { border-radius: 14px; }
    header { padding: 22px 16px 18px; }
    main { padding: 16px 14px; }
    .item {
      grid-template-columns: auto minmax(0, 1fr);
      gap: 0.1rem 0.6rem;
    }
    .hora { grid-row: 1; grid-column: 1; }
    .tag {
      grid-row: 1;
      grid-column: 2;
      justify-self: end;
      align-self: center;
    }
    .texto { grid-row: 2; grid-column: 1 / -1; }
  }

  @media print {
    @page { size: A4; margin: 11mm 12mm 13mm; }
    :root {
      --fundo: #fff; --papel: #fff; --papel-2: #fff;
      --tinta: #000; --tinta-fraca: #333; --linha: #bbb;
      --vermelho: #000; --amarelo: #000;
    }
    body {
      padding: 0;
      background: #fff;
      font-size: 9.5pt;
      line-height: 1.3;
    }
    .folha { max-width: none; border-radius: 0; box-shadow: none; }
    .tema, .botoes, .atalhos { display: none; }

    /* Cabeçalho enxuto: ele repetia espaço que faltava nas atividades. */
    header {
      padding: 0 0 0.4rem;
      background: #fff;
      color: #000;
      border-bottom: 2px solid #000;
      margin-bottom: 0.6rem;
    }
    .olho { color: #000; font-size: 6.8pt; margin-bottom: 0.2rem; }
    h1 { font-size: 21pt; margin-bottom: 0.2rem; }
    .sub { color: #000; font-size: 10pt; }
    .meta { color: #333; font-size: 7.6pt; margin-top: 0.25rem; }

    /* Dia pode quebrar entre páginas; item, não. */
    main { padding: 0; }
    .dia { margin-bottom: 0.8rem; break-inside: auto; }
    .dia h2 {
      margin: 0 0 0.2rem;
      padding-bottom: 0.18rem;
      border-bottom-width: 1px;
      break-after: avoid;
      break-inside: avoid;
    }
    .num { font-size: 13pt; }
    .rotulo { font-size: 7.2pt; color: #000; }

    .item { padding: 0.18rem 0; break-inside: avoid; }
    .hora { font-size: 6.9pt; color: #000; }
    .titulo { font-size: 8.9pt; line-height: 1.22; }
    .local { font-size: 7.3pt; margin-top: 0; color: #333; }
    .tag { font-size: 6.2pt; padding: 0 5px; color: #000; }

    footer { background: #fff; color: #333; padding: 0.6rem 0 0; border-top: 1px solid #bbb; font-size: 6.8pt; }
    a { color: inherit; text-decoration: none; }
    /* No papel, "mapa" vira link morto: sai da impressão. */
    .mapa, .acoes { display: none; }
  }
</style>
</head>
<body>
<div class="folha">
  <header>
    <button class="tema" id="tema" type="button" aria-label="Mudar para tema claro">☀</button>
    <p class="olho">30º Encontro Nacional da RENAP · XI Seminário do IPDMS · 20º Encontro da RENAJU</p>
    <h1>Programação completa</h1>
    <p class="sub">11 a 14 de novembro de 2026 · UFPB, Campus I · João Pessoa/PB</p>
    <p class="meta">${total} atividades em ${dias.length} dias · versão de ${escapar(
      hoje.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    )}</p>

    <div class="botoes">
      <button class="botao botao--forte" type="button" onclick="window.print()">Imprimir</button>
      <a class="botao" href="/lancamentos">Lançamentos de livros</a>
      <a class="botao" href="/checkin">Check-in</a>
      <a class="botao botao--zap" href="https://wa.me/?text=${encodeURIComponent(
        "Programação completa do 30º Encontro Nacional da RENAP, XI Seminário do IPDMS e 20º Encontro da RENAJU — João Pessoa, 11 a 14 de novembro de 2026.\n\nhttps://encontrolenirlivre.pages.dev/programa",
      )}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 4.54 0 8.23 3.69 8.23 8.23s-3.69 8.25-8.23 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.57.12-.17.25-.66.8-.81.96-.15.17-.3.19-.55.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.3.37-.45.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.57-1.37-.78-1.88-.21-.5-.42-.43-.57-.44-.15-.01-.32-.01-.49-.01-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"/></svg>
        WhatsApp
      </a>
    </div>

    <nav class="atalhos" aria-label="Ir direto para um dia">${atalhos}</nav>
  </header>

  <main>${blocos}
  </main>

  <footer>
    <p>Programação sujeita a alteração pela organização. Salas e horários conferidos com o documento de 8 de novembro de 2026.</p>
    <p>Presença por atividade: <a href="/checkin">check-in</a> · Cartazes com QR para imprimir: <a href="/entrega-encontro/qrcodes-encontrao.pdf">PDF com 40 cartazes (sem a cultural)</a>.</p>
    <p>Site do encontro: <a href="https://encontrolenirlivre.pages.dev">encontrolenirlivre.pages.dev</a> · Seminário: <a href="https://seminariovenasabertas.pages.dev">seminariovenasabertas.pages.dev</a></p>
  </footer>
</div>
<script>
  const temaBotao = document.getElementById("tema");
  function pintarTema() {
    const escuro = document.documentElement.dataset.theme !== "light";
    temaBotao.textContent = escuro ? "☀" : "☾";
    temaBotao.setAttribute(
      "aria-label",
      escuro ? "Mudar para tema claro" : "Mudar para tema escuro",
    );
  }
  temaBotao.addEventListener("click", () => {
    const novo =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = novo;
    try {
      localStorage.setItem("ecnl-theme", novo);
    } catch (e) {}
    pintarTema();
  });
  pintarTema();

  function copiarLegado(texto) {
    const area = document.createElement("textarea");
    area.value = texto;
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (erro) {}
    document.body.removeChild(area);
    return ok;
  }
  async function copiar(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await Promise.race([
          navigator.clipboard.writeText(texto),
          new Promise(function (_, rejeitar) {
            window.setTimeout(function () { rejeitar(new Error("tempo")); }, 1200);
          }),
        ]);
        return true;
      } catch (erro) {}
    }
    return copiarLegado(texto);
  }
  document.querySelectorAll("[data-copia], [data-link]").forEach(function (botao) {
    botao.addEventListener("click", async function () {
      const texto = botao.dataset.copia || botao.dataset.link || "";
      const ok = await copiar(texto);
      const original = botao.textContent;
      botao.textContent = ok ? "Copiado" : "Não deu";
      window.setTimeout(function () { botao.textContent = original; }, 1600);
    });
  });
</script>
</body>
</html>`;

mkdirSync("public", { recursive: true });
writeFileSync(SAIDA, html, "utf8");

console.log(`programa.html: ${dias.length} dias, ${total} atividades → ${SAIDA}`);
