"""Gera a página /lancamentos a partir do JSON sanitizado (sem telefones)."""
import html
import io
import json
import os
import urllib.parse

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENTRADA = os.path.join(RAIZ, "src", "content", "lancamentos.json")
SAIDA = os.path.join(RAIZ, "public", "lancamentos.html")

with io.open(ENTRADA, encoding="utf-8") as arquivo:
    livros = json.load(arquivo)

LINK = "https://encontrolenirlivre.pages.dev/lancamentos"
MENSAGEM = (
    "Lançamentos de livros do encontro: oito obras em 12/11, às 19h, "
    "no Armazém do Campo. Lista completa:"
)
ZAP = "https://wa.me/?text=" + urllib.parse.quote(f"{MENSAGEM}\n\n{LINK}")


def esc(valor):
    return html.escape(str(valor or ""))


def cortar(texto, limite=260):
    texto = " ".join(str(texto or "").split())
    if len(texto) <= limite:
        return esc(texto)
    return esc(texto[:limite].rsplit(" ", 1)[0] + "…")


def cartao(livro, indice):
    detalhes = ""
    if livro.get("descricao"):
        detalhes += (
            "<details><summary>Sinopse</summary><p>"
            + esc(livro["descricao"])
            + "</p></details>"
        )
    if livro.get("relacao"):
        detalhes += (
            "<details><summary>Relação com o encontro</summary><p>"
            + esc(livro["relacao"])
            + "</p></details>"
        )
    venda = livro.get("venda") or ""
    preco = livro.get("preco") or ""
    if preco and preco.lower() not in ("não", "nao"):
        venda = (venda + " · " + preco).strip(" ·")
    return f"""
      <article class="livro">
        <div class="livro-topo">
          <span class="numero">{indice:02d}</span>
          <span class="tag">{esc(livro.get('vinculo'))}</span>
        </div>
        <h2>{esc(livro.get('titulo'))}</h2>
        <p class="autoria">{esc(livro.get('autores'))}</p>
        <p class="ficha">{esc(livro.get('editora'))} · {esc(livro.get('formato'))} · {esc(venda)}</p>
        <p class="resumo">{cortar(livro.get('descricao'))}</p>
        {detalhes}
      </article>"""


cartoes = "".join(cartao(livro, i) for i, livro in enumerate(livros, 1))
pagina = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lançamentos de livros — Encontro RENAP 2026</title>
<meta name="description" content="Oito livros e publicações lançados em 12/11, às 19h, no Armazém do Campo, durante o 30º Encontro Nacional da RENAP, o XI Seminário do IPDMS e o 20º Encontro da RENAJU.">
<style>
  :root {{ --fundo:#0f0d0b; --papel:#f5ecda; --papel2:#efe3cc; --tinta:#171410; --tinta2:#5b5242; --linha:#d9cbb1; --vermelho:#b3261e; --amarelo:#f2c94c; }}
  html[data-theme="light"] {{ --fundo:#e9dfc6; --papel:#fffdf7; --papel2:#f4ead6; --tinta:#2a2521; --tinta2:#4a423a; --linha:#c2b193; --vermelho:#bf2a26; --amarelo:#d98f2a; }}
  @font-face {{ font-family:"Clash Display"; src:url("/fonts/ClashDisplay-Semibold.woff2") format("woff2"); font-weight:600; font-display:swap; }}
  @font-face {{ font-family:"General Sans"; src:url("/fonts/GeneralSans-Regular.woff2") format("woff2"); font-weight:400; font-display:swap; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:radial-gradient(circle at 12% 0%,#2a2118 0,transparent 42%),var(--fundo); color:var(--tinta); font-family:"General Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; line-height:1.5; padding:18px 14px 46px; }}
  html[data-theme="light"] body {{ background:var(--fundo); }}
  .folha {{ max-width:900px; margin:0 auto; background:var(--papel); border-radius:20px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,.45); }}
  header {{ background:linear-gradient(135deg,#1d1a14,#2b251c); color:#f7efdd; padding:28px 22px 24px; position:relative; }}
  .tema {{ position:absolute; top:14px; right:14px; width:2rem; height:2rem; border-radius:50%; border:1px solid #5a4d3c; background:#2b251c; color:#f7efdd; font-size:1rem; line-height:1; cursor:pointer; }}
  .tema:hover {{ border-color:var(--amarelo); color:var(--amarelo); }}
  .olho {{ font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:#d9cdb7; margin:0 0 .6rem; }}
  h1 {{ font-size:clamp(1.5rem,5vw,2.2rem); line-height:1.1; margin:0 0 .5rem; font-family:"Clash Display","Arial Narrow",system-ui,sans-serif; }}
  header p {{ margin:.2rem 0; color:#e6dbc6; }}
  .voltar {{ display:inline-block; margin-top:1rem; color:#1a150e; background:var(--amarelo); padding:.55rem .8rem; border-radius:999px; font-weight:800; text-decoration:none; font-size:.85rem; }}
  .zap {{ display:inline-flex; align-items:center; gap:.35rem; margin-top:1rem; margin-left:.45rem; padding:.55rem .8rem; border-radius:999px; background:#25d366; color:#073b1b; font-weight:800; text-decoration:none; font-size:.85rem; }}
  .zap svg {{ width:1rem; height:1rem; fill:currentColor; }}
  main {{ padding:20px; }}
  .livro {{ border:1px solid var(--linha); background:var(--papel2); border-radius:14px; padding:16px 16px 12px; margin:0 0 14px; }}
  .livro-topo {{ display:flex; justify-content:space-between; align-items:center; gap:.6rem; margin-bottom:.5rem; }}
  .numero {{ font-family:ui-monospace,Consolas,monospace; font-size:.78rem; color:var(--vermelho); font-weight:800; }}
  .tag {{ font-size:.68rem; letter-spacing:.06em; text-transform:uppercase; background:#fff6dd; border:1px solid #e6cf8f; color:#5a4712; padding:.2rem .5rem; border-radius:999px; font-weight:800; }}
  h2 {{ font-size:1.08rem; line-height:1.22; margin:0 0 .35rem; font-family:"Clash Display","Arial Narrow",system-ui,sans-serif; }}
  .autoria {{ font-size:.86rem; color:var(--tinta2); margin:0 0 .35rem; }}
  .ficha {{ font-size:.76rem; color:var(--tinta2); margin:0 0 .55rem; }}
  .resumo {{ font-size:.9rem; margin:0 0 .4rem; }}
  details {{ border-top:1px solid var(--linha); padding-top:.45rem; margin-top:.45rem; }}
  summary {{ cursor:pointer; font-size:.82rem; font-weight:750; color:var(--vermelho); }}
  details p {{ font-size:.86rem; color:var(--tinta2); margin:.45rem 0 0; }}
  footer {{ background:#1d1a14; color:#d9cdb7; text-align:center; padding:18px; font-size:.78rem; }}
  footer a {{ color:var(--amarelo); }}
</style>
</head>
<body>
<div class="folha">
  <header>
    <button class="tema" id="tema" type="button" aria-label="Mudar para tema claro">☀</button>
    <p class="olho">30º Encontro Nacional da RENAP · XI Seminário do IPDMS · 20º Encontro da RENAJU</p>
    <h1>Lançamentos de livros</h1>
    <p><strong>12/11, às 19h · Armazém do Campo · João Pessoa</strong></p>
    <p>Oito obras de advogadas, advogados, pesquisadoras e movimentos sociais.</p>
    <a class="voltar" href="/programa">Ver a programação completa</a>
    <a class="zap" href="{ZAP}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 4.54 0 8.23 3.69 8.23 8.23s-3.69 8.25-8.23 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.57.12-.17.25-.66.8-.81.96-.15.17-.3.19-.55.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.3.37-.45.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.57-1.37-.78-1.88-.21-.5-.42-.43-.57-.44-.15-.01-.32-.01-.49-.01-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"/></svg>
      WhatsApp
    </a>
  </header>
  <main>
    {cartoes}
  </main>
  <footer>
    <a href="https://encontrolenirlivre.pages.dev">Site do encontro</a> ·
    <a href="https://seminariovenasabiertas.pages.dev">Site do seminário</a>
  </footer>
</div>
</body>
</html>
"""

SCRIPT_TEMA = """<script>
  (function () {
    var b = document.getElementById("tema");
    if (!b) return;
    function p() {
      var escuro = document.documentElement.dataset.theme !== "light";
      b.textContent = escuro ? "☀" : "☾";
      b.setAttribute("aria-label", escuro ? "Mudar para tema claro" : "Mudar para tema escuro");
    }
    b.addEventListener("click", function () {
      var novo = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = novo;
      try { localStorage.setItem("ecnl-theme", novo); } catch (e) {}
      p();
    });
    p();
  })();
</script>"""
CABECA_TEMA = (
    '<script>try{var t=localStorage.getItem("ecnl-theme");'
    'document.documentElement.dataset.theme=t==="light"?"light":"dark";}catch(e){}</script>'
)
pagina = pagina.replace("<head>", "<head>" + CABECA_TEMA, 1)
pagina = pagina.replace("</body>", SCRIPT_TEMA + "\n</body>", 1)

with io.open(SAIDA, "w", encoding="utf-8") as arquivo:
    arquivo.write(pagina)
print(SAIDA, len(pagina), "caracteres", len(livros), "livros")
