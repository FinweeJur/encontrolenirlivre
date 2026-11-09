/**
 * Gera a página de check-in (`public/checkin.html`).
 *
 * Arquivo único, sem framework: abre rápido no celular, dentro do wi-fi ruim
 * do campus. A lista vem embutida, então a página funciona antes de falar com
 * a API.
 *
 * Três entradas:
 *  - `/c/11-3` (link curto do QR) — abre já na atividade;
 *  - `/checkin?s=11-3` — mesmo efeito, para links antigos;
 *  - `/checkin` sem chave — escolhe sozinho a atividade deste horário e
 *    oferece "trocar" com busca.
 *
 * Sem login. Se a rede cair, o registro fica no aparelho e sobe sozinho.
 */
import { build } from "esbuild";
import { Buffer } from "node:buffer";
import { writeFileSync } from "node:fs";

const SAIDA = "public/checkin.html";
const API = "https://encontrolenirlivre.pages.dev/api/checkin";

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

  return import(
    "data:text/javascript;base64," + Buffer.from(saida.outputFiles[0].text).toString("base64")
  );
};

const mod = await carregar("src/content/sessoes.ts");
const sessoes = mod.sessoes;
const porDia = mod.sessoesPorDia();

const escapar = (texto) =>
  String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const opcoes = porDia
  .map(
    (dia) => `
      <optgroup label="${escapar(dia.dia)}/11 · ${escapar(dia.semana)}">
        ${dia.itens
          .map(
            (s) =>
              `<option value="${escapar(s.chave)}">${escapar(s.dia)}/11 ${escapar(
                s.hora,
              )} — ${escapar(s.titulo.slice(0, 70))}</option>`,
          )
          .join("")}
      </optgroup>`,
  )
  .join("");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Presença no Evento — Encontrão RENAP · IPDMS · RENAJU 2026</title>
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#1a1512">
<link rel="icon" href="/img/favicon.png">
<style>
  :root {
    --papel: #f6f1e7;
    --papel-2: #efe6d4;
    --tinta: #2a2521;
    --tinta-fraca: #6d6153;
    --linha: #d9ccb2;
    --vermelho: #bf2a26;
    --verde: #1e6b4f;
    --sombra: 0 18px 40px -28px rgba(0,0,0,.5);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--papel);
    color: var(--tinta);
    font-family: "Satoshi", system-ui, -apple-system, "Segoe UI", sans-serif;
    line-height: 1.5;
    padding: 1rem 1rem 2.5rem;
  }
  .casca { max-width: 32rem; margin: 0 auto; }
  .olho {
    margin: 0 0 .3rem;
    font-family: ui-monospace, "SFMono-Regular", monospace;
    font-size: .62rem;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--vermelho);
  }
  h1 {
    margin: 0 0 .2rem;
    font-size: 1.6rem;
    line-height: 1.05;
    letter-spacing: -.02em;
  }
  .sub { margin: 0 0 1rem; font-size: .85rem; color: var(--tinta-fraca); }

  /* ---------- modo recepção: aparelho da equipe ---------- */
  .recepcao {
    border: 1px solid #c9a227;
    background: #fbf3d9;
    color: #5b4a12;
    border-radius: 8px;
    padding: .6rem .8rem;
    margin: 0 0 .8rem;
    font-size: .78rem;
  }
  .recepcao strong {
    display: block; font-size: .7rem; text-transform: uppercase;
    letter-spacing: .09em;
  }
  .recepcao p { margin: .15rem 0 .4rem; }
  .recepcao__linha {
    display: flex; align-items: center; justify-content: space-between;
    gap: .6rem; flex-wrap: wrap;
  }
  .recepcao__conta { font-family: ui-monospace, monospace; font-size: .68rem; }
  .recepcao button {
    border: 1px solid currentColor; background: transparent; color: inherit;
    border-radius: 5px; padding: .35rem .6rem; font: inherit; font-size: .7rem;
    cursor: pointer; min-height: 34px;
  }
  .recepcao button:active { transform: translateY(1px); }

  /* ---------- estado da rede ---------- */
  .rede {
    display: none;
    align-items: center;
    gap: .4rem;
    margin: 0 0 .8rem;
    padding: .45rem .7rem;
    border-radius: 6px;
    font-family: ui-monospace, "SFMono-Regular", monospace;
    font-size: .68rem;
    letter-spacing: .04em;
    border: 1px solid var(--linha);
    background: var(--papel-2);
    color: var(--tinta-fraca);
  }
  .rede.is-visivel { display: flex; }
  .rede--off { border-color: var(--vermelho); color: var(--vermelho); }
  .rede--on { border-color: var(--verde); color: var(--verde); }
  .rede__ponto {
    width: .45rem; height: .45rem; border-radius: 50%;
    background: currentColor; flex: none;
    animation: pulso 1.8s ease-in-out infinite;
  }

  /* ---------- cartão da atividade ---------- */
  .cartao {
    position: relative;
    border: 1px solid var(--linha);
    border-left: 3px solid var(--vermelho);
    border-radius: 8px;
    background: var(--papel-2);
    padding: .9rem 1rem;
    margin-bottom: .9rem;
    transition: border-color .3s, background-color .3s;
  }
  .cartao.is-feito { border-left-color: var(--verde); background: color-mix(in srgb, var(--verde) 9%, var(--papel-2)); }
  .cartao__hora {
    margin: 0;
    font-family: ui-monospace, "SFMono-Regular", monospace;
    font-size: .66rem;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--vermelho);
  }
  .cartao__titulo { margin: .15rem 0 .3rem; font-size: 1rem; font-weight: 600; }
  .cartao__local { margin: 0; font-size: .82rem; color: var(--tinta-fraca); }
  .cartao__org {
    display: inline-block;
    margin-top: .4rem;
    padding: .05rem .45rem;
    border: 1px solid currentColor;
    border-radius: 100px;
    font-family: ui-monospace, "SFMono-Regular", monospace;
    font-size: .6rem;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--tinta-fraca);
  }

  .trocar {
    margin: .6rem 0 0;
    padding: .35rem .7rem;
    border: 1px solid var(--linha);
    border-radius: 100px;
    background: transparent;
    color: var(--tinta-fraca);
    font: inherit;
    font-size: .74rem;
    cursor: pointer;
  }
  .trocar:hover { border-color: var(--vermelho); color: var(--vermelho); }

  /* ---------- escolha e busca ---------- */
  .escolha { display: none; margin: 0 0 1rem; }
  .escolha.is-aberta { display: block; animation: entra .25s ease both; }
  .busca { margin-bottom: .5rem; }

  label { display: block; font-size: .78rem; font-weight: 600; margin: 0 0 .25rem; }
  input, select {
    width: 100%;
    padding: .7rem .8rem;
    border: 1px solid var(--linha);
    border-radius: 6px;
    background: #fff;
    color: var(--tinta);
    font: inherit;
    font-size: 1rem;
  }
  input:focus, select:focus, button:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--vermelho) 55%, transparent);
    outline-offset: 1px;
    border-color: var(--vermelho);
  }
  .campo { margin-bottom: .8rem; }
  .dica { margin: .2rem 0 0; font-size: .72rem; color: var(--tinta-fraca); }

  /* ---------- botão ---------- */
  .enviar {
    position: relative;
    width: 100%;
    padding: .9rem 1rem;
    border: 0;
    border-radius: 6px;
    background: var(--vermelho);
    color: #fdf3de;
    font: inherit;
    font-size: .95rem;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    cursor: pointer;
    overflow: hidden;
    transition: transform .12s ease, background-color .2s;
  }
  .enviar:active { transform: scale(.985); }
  .enviar:disabled { opacity: .6; cursor: not-allowed; }
  .enviar.is-enviando { background: color-mix(in srgb, var(--vermelho) 70%, var(--tinta)); }
  .enviar.is-enviando::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.28) 50%, transparent 80%);
    transform: translateX(-100%);
    animation: varre 1.1s linear infinite;
  }

  /* ---------- recado ---------- */
  .recado {
    display: none;
    margin: .9rem 0 0;
    padding: .8rem .9rem;
    border-radius: 6px;
    font-size: .9rem;
    line-height: 1.45;
    align-items: center;
    gap: .6rem;
  }
  .recado.is-visivel { display: flex; animation: entra .25s ease both; }
  .recado--ok { background: color-mix(in srgb, var(--verde) 12%, var(--papel)); border: 1px solid var(--verde); }
  .recado--erro { background: color-mix(in srgb, var(--vermelho) 10%, var(--papel)); border: 1px solid var(--vermelho); animation: treme .3s ease both; }
  .recado--espera { background: var(--papel-2); border: 1px solid var(--linha); }
  .recado__icone { width: 1.5rem; height: 1.5rem; flex: none; }
  .recado__icone circle, .recado__icone path {
    fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;
  }
  .recado--ok .recado__icone { color: var(--verde); }
  .recado--erro .recado__icone { color: var(--vermelho); }
  .recado--ok .recado__icone path { stroke-dasharray: 26; stroke-dashoffset: 26; animation: desenha .45s .1s ease forwards; }

  .pe { margin: 1.4rem 0 0; font-size: .72rem; color: var(--tinta-fraca); line-height: 1.45; }
  .pe a { color: var(--vermelho); }
  .oculto { display: none !important; }

  @keyframes entra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes treme { 0%,100% { transform: none; } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
  @keyframes desenha { to { stroke-dashoffset: 0; } }
  @keyframes varre { to { transform: translateX(100%); } }
  @keyframes pulso { 0%,100% { opacity: 1; } 50% { opacity: .35; } }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --papel: #1a1512; --papel-2: #221b16; --tinta: #f2e8d2;
      --tinta-fraca: #a99a83; --linha: #3a3027; --vermelho: #cf4b43; --verde: #6fbf9a;
    }
    input, select { background: #271f19; color: var(--tinta); }
    .recepcao { background: #2a2410; color: #e8d48a; border-color: #6b5a20; }
  }
</style>
</head>
<body>
<div class="casca">
  <p class="olho" id="olho">30º Encontro da RENAP · XI Seminário do IPDMS · 20º Encontro da RENAJU</p>
  <h1>Presença no Evento</h1>
  <p class="sub">Marque sua presença nesta atividade. Leva 15 segundos.</p>

  <div class="recepcao" id="recepcao" hidden>
    <strong>Modo recepção</strong>
    <p>Este aparelho registra presenças para várias pessoas. Ao terminar o turno, toque em “Limpar dados”.</p>
    <div class="recepcao__linha">
      <span class="recepcao__conta"><span id="recepcao-contador">0</span> registro(s) neste aparelho</span>
      <button type="button" id="limpar-dados">Limpar dados</button>
    </div>
  </div>

  <p class="rede" id="rede" role="status" aria-live="polite">
    <span class="rede__ponto" aria-hidden="true"></span>
    <span id="rede-texto"></span>
  </p>

  <div class="cartao" id="cartao">
    <p class="cartao__hora" id="sessao-hora">—</p>
    <p class="cartao__titulo" id="sessao-titulo">Escolhendo a atividade deste horário…</p>
    <p class="cartao__local" id="sessao-local"></p>
    <span class="cartao__org" id="sessao-org"></span>
    <br>
    <button type="button" class="trocar" id="trocar">Não é esta? Trocar atividade</button>
  </div>

  <div class="escolha" id="escolha">
    <div class="campo busca">
      <label for="busca">Buscar atividade</label>
      <input id="busca" type="search" placeholder="Digite GD, oficina, sala, dia…" autocomplete="off">
    </div>
    <div class="campo">
      <label for="sessao">Atividade</label>
      <select id="sessao" name="sessao">
        <option value="">Selecione…</option>
        ${opcoes}
      </select>
    </div>
  </div>

  <form id="form" novalidate>
    <div class="campo">
      <label for="nome">Seu nome completo</label>
      <input id="nome" name="nome" type="text" autocomplete="name" maxlength="80" required placeholder="Nome e sobrenome">
    </div>

    <div class="campo">
      <label for="email">E-mail <span style="font-weight:400;color:var(--tinta-fraca)">(opcional)</span></label>
      <input id="email" name="email" type="email" autocomplete="email" maxlength="120" placeholder="voce@exemplo.com">
      <p class="dica">Serve para evitar registro repetido e para o certificado.</p>
    </div>

    <button class="enviar" id="enviar" type="submit">Registrar presença</button>
  </form>

  <div id="recado" class="recado" role="status" aria-live="polite"></div>

  <p class="pe">Usamos seu nome e e-mail só para registrar presença e emitir certificado. Não compartilhamos com terceiros. Dúvidas: <a href="mailto:ipdmscorreio@gmail.com">ipdmscorreio@gmail.com</a>.</p>
</div>

<script>
  const API = ${JSON.stringify(API)};
  const SESSOES = ${JSON.stringify(sessoes)};
  const FILA = "ecnl-checkin-fila";
  const CONTADOR = "ecnl-recepcao-contador";
  const RECEPCAO = new URLSearchParams(location.search).get("recepcao") === "1";

  const porChave = new Map(SESSOES.map((s) => [s.chave, s]));
  const cartao = document.getElementById("cartao");
  const escolha = document.getElementById("escolha");
  const select = document.getElementById("sessao");
  const busca = document.getElementById("busca");
  const recado = document.getElementById("recado");
  const botao = document.getElementById("enviar");
  const form = document.getElementById("form");
  const rede = document.getElementById("rede");
  const redeTexto = document.getElementById("rede-texto");

  let atual = null;

  /* ---------- modo recepção ---------- */
  function lerContador() {
    try {
      return Number(sessionStorage.getItem(CONTADOR) || 0);
    } catch (e) {
      return 0;
    }
  }

  function pintarContador() {
    document.getElementById("recepcao-contador").textContent = lerContador();
  }

  function contar() {
    try {
      sessionStorage.setItem(CONTADOR, String(lerContador() + 1));
    } catch (e) {}
    pintarContador();
  }

  function limparCampos() {
    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    document.getElementById("nome").focus();
  }

  if (RECEPCAO) {
    document.getElementById("recepcao").hidden = false;
    document.querySelector('label[for="nome"]').textContent = "Nome completo da pessoa";
    document.querySelector('label[for="email"]').innerHTML =
      'E-mail da pessoa <span style="font-weight:400;color:var(--tinta-fraca)">(opcional)</span>';
    document.getElementById("nome").autocomplete = "off";
    document.getElementById("email").autocomplete = "off";
    document.querySelector(".sub").textContent =
      "Registre a presença de quem está na sala. Leva 15 segundos.";
    pintarContador();
  }

  document.getElementById("limpar-dados").addEventListener("click", () => {
    const fila = lerFila();
    const pergunta = fila.length
      ? "Há " + fila.length + " registro(s) ainda não enviado(s). Se limpar agora, eles serão perdidos. Continuar?"
      : "Apagar os dados deste aparelho?";
    if (!window.confirm(pergunta)) return;

    try { localStorage.removeItem(FILA); } catch (e) {}
    try { sessionStorage.removeItem(CONTADOR); } catch (e) {}
    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    pintarContador();
    mostrarRede();
    avisar("ok", "Dados deste aparelho apagados.");
  });

  /* ---------- hora: "13h", "8h30", "13h às 16h30" ---------- */
  function minutos(texto) {
    const t = String(texto).trim();
    const par = t.split(" às ");
    const uma = (v) => {
      const m = /^(\\d{1,2})h(\\d{2})?$/.exec(v.trim());
      if (!m) return null;
      return Number(m[1]) * 60 + (m[2] ? Number(m[2]) : 0);
    };
    if (par.length === 2) {
      const a = uma(par[0]);
      const b = uma(par[1]);
      if (a === null || b === null || b <= a) return null;
      return { inicio: a, fim: b };
    }
    const a = uma(t);
    if (a === null) return null;
    return { inicio: a, fim: a + 60 };
  }

  /* agora no fuso de Brasília, sem depender do aparelho */
  function agoraBrasilia() {
    const d = new Date(Date.now() - 3 * 3600 * 1000);
    return {
      dia: String(d.getUTCDate()),
      mes: d.getUTCMonth() + 1,
      minuto: d.getUTCHours() * 60 + d.getUTCMinutes(),
    };
  }

  /** A atividade que está acontecendo agora; se nenhuma, a próxima do dia. */
  function sessaoDoMomento() {
    const agora = agoraBrasilia();
    if (agora.mes !== 11) return null;

    const doDia = SESSOES.filter((s) => s.dia === agora.dia);
    if (!doDia.length) return null;

    const comHora = doDia
      .map((s) => ({ s, janela: minutos(s.hora) }))
      .filter((x) => x.janela);

    const dentro = comHora.filter(
      (x) => x.janela.inicio <= agora.minuto && agora.minuto < x.janela.fim,
    );
    if (dentro.length) {
      // várias em paralelo: fica com a que começou por último
      dentro.sort((a, b) => b.janela.inicio - a.janela.inicio);
      return dentro[0].s;
    }

    const proxima = comHora
      .filter((x) => x.janela.inicio > agora.minuto)
      .sort((a, b) => a.janela.inicio - b.janela.inicio)[0];
    return proxima ? proxima.s : null;
  }

  function pintar(sessao) {
    if (!sessao) return;
    atual = sessao;
    document.getElementById("sessao-hora").textContent =
      sessao.dia + "/11 · " + sessao.hora;
    document.getElementById("sessao-titulo").textContent = sessao.titulo;
    document.getElementById("sessao-local").textContent = sessao.local || "";
    document.getElementById("sessao-org").textContent = sessao.organizacao;
    select.value = sessao.chave;
    document.title = "Presença no Evento — " + sessao.titulo;
  }

  /* ---------- entrada: /c/chave, ?s=chave ou nada ---------- */
  function chaveDaUrl() {
    const porQuery = new URLSearchParams(location.search).get("s");
    if (porQuery) return porQuery;
    const partes = location.pathname.split("/").filter(Boolean);
    const ultima = partes[partes.length - 1] || "";
    return porChave.has(ultima) ? ultima : "";
  }

  const chave = chaveDaUrl();
  if (chave) {
    pintar(porChave.get(chave));
  } else {
    const doMomento = sessaoDoMomento();
    if (doMomento) {
      pintar(doMomento);
    } else {
      escolha.classList.add("is-aberta");
      document.getElementById("sessao-titulo").textContent = "Escolha a atividade";
    }
  }

  document.getElementById("trocar").addEventListener("click", () => {
    escolha.classList.toggle("is-aberta");
    if (escolha.classList.contains("is-aberta")) busca.focus();
  });

  select.addEventListener("change", () => {
    const sessao = porChave.get(select.value);
    if (sessao) pintar(sessao);
  });

  /* ---------- busca por texto ---------- */
  busca.addEventListener("input", () => {
    const alvo = busca.value.trim().toLowerCase();
    for (const option of select.options) {
      if (!option.value) continue;
      const encontrou = !alvo || option.textContent.toLowerCase().includes(alvo);
      option.hidden = !encontrou;
    }
  });

  /* ---------- fila offline ---------- */
  function lerFila() {
    try {
      return JSON.parse(localStorage.getItem(FILA) || "[]");
    } catch (e) {
      return [];
    }
  }

  function gravarFila(fila) {
    try {
      localStorage.setItem(FILA, JSON.stringify(fila));
    } catch (e) {}
  }

  function mostrarRede() {
    const fila = lerFila();
    if (!navigator.onLine) {
      rede.className = "rede is-visivel rede--off";
      redeTexto.textContent =
        "Sem internet. " + (fila.length ? fila.length + " registro(s) guardado(s)." : "O registro será guardado aqui.");
      return;
    }
    if (fila.length) {
      rede.className = "rede is-visivel rede--on";
      redeTexto.textContent = "Enviando " + fila.length + " registro(s) guardado(s)…";
      return;
    }
    rede.className = "rede";
  }

  async function subirFila() {
    const fila = lerFila();
    if (!fila.length || !navigator.onLine) {
      mostrarRede();
      return;
    }
    const restantes = [];
    for (const item of fila) {
      try {
        const r = await fetch(API, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!r.ok && r.status !== 400) restantes.push(item);
      } catch (e) {
        restantes.push(item);
      }
    }
    gravarFila(restantes);
    mostrarRede();
  }

  window.addEventListener("online", subirFila);
  window.addEventListener("offline", mostrarRede);
  setInterval(subirFila, 30000);
  mostrarRede();
  subirFila();

  /* ---------- recado com ícone ---------- */
  const ICONE_OK = '<svg class="recado__icone" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.5"/></svg>';
  const ICONE_ERRO = '<svg class="recado__icone" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v6M12 16.5v.5"/></svg>';
  const ICONE_ESPERA = '<svg class="recado__icone" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/></svg>';

  function avisar(tipo, texto) {
    const icone = tipo === "ok" ? ICONE_OK : tipo === "erro" ? ICONE_ERRO : ICONE_ESPERA;
    recado.className = "recado is-visivel recado--" + tipo;
    recado.innerHTML = icone + "<span>" + texto + "</span>";
  }

  /* ---------- envio ---------- */
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const sessao = atual || porChave.get(select.value);
    if (!sessao) {
      avisar("erro", "Escolha a atividade primeiro.");
      escolha.classList.add("is-aberta");
      return;
    }

    const nome = document.getElementById("nome").value.trim();
    if (nome.length < 2) {
      avisar("erro", "Escreva seu nome completo.");
      document.getElementById("nome").focus();
      return;
    }

    const dados = {
      chave: sessao.chave,
      nome,
      email: document.getElementById("email").value.trim(),
    };

    botao.disabled = true;
    botao.classList.add("is-enviando");
    avisar("espera", "Registrando…");

    try {
      const resposta = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dados),
      });
      const corpo = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        avisar("erro", corpo.erro || "Não consegui registrar. Tente de novo.");
      } else {
        cartao.classList.add("is-feito");
        avisar(
          "ok",
          (corpo.duplicado ? corpo.mensagem : "Presença registrada.") +
            (corpo.titulo ? " — " + corpo.titulo : ""),
        );
        if (RECEPCAO) {
          if (!corpo.duplicado) contar();
          limparCampos();
        }
      }
    } catch (e) {
      const fila = lerFila();
      fila.push(dados);
      gravarFila(fila);
      mostrarRede();
      avisar(
        "espera",
        "Sem internet agora. Guardei no aparelho e envio sozinho quando a rede voltar.",
      );
      if (RECEPCAO) {
        contar();
        limparCampos();
      }
    } finally {
      botao.classList.remove("is-enviando");
      botao.disabled = false;
    }
  });
</script>
</body>
</html>`;

writeFileSync(SAIDA, html, "utf8");
console.log(`checkin.html: ${sessoes.length} atividades → ${SAIDA}`);
