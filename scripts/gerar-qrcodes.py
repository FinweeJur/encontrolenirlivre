"""
Gera os QR de presença e o PDF de cartazes A4.

Um cartaz por atividade, ocupando a folha:
  - título grande com a fonte do site (Zodiak);
  - nome da atividade em Satoshi;
  - dia, hora, sala e organização;
  - QR grande, com a arte do seminário no meio;
  - link curto do is.gd e, abaixo, o endereço longo como reserva.

Também salva um PNG por atividade, para uso na tela.
"""
import io
import json
import os

import qrcode
from PIL import Image, ImageDraw, ImageFont
from qrcode.constants import ERROR_CORRECT_H

PROJ = r"X:\DevCoder\OpenCode\encontrolenirlivre"
ARTE = os.path.join(PROJ, "public", "img", "xi-raizes.png")
SESSOES = os.path.join(PROJ, ".cache", "sessoes.json")
CURTOS = os.path.join(PROJ, ".cache", "curtos.json")
FONTES = os.path.join(PROJ, ".cache", "fonts")
PASTA_QR = os.path.join(PROJ, "public", "qr")
PDF = os.path.join(PROJ, "public", "qrcodes-encontrao.pdf")

BASE = "https://encontrolenirlivre.pages.dev/c/"

PAPEL = (246, 241, 231)
TINTA = (42, 37, 33)
FRACA = (109, 97, 83)
LINHA = (217, 204, 178)
VERMELHO = (191, 42, 38)

A4 = (2480, 3508)  # 300 dpi

ARQUIVOS = {
    "titulo": ("satoshi-forte.ttf", 168),
    "atividade": ("satoshi-forte.ttf", 86),
    "info": ("satoshi.ttf", 58),
    "link": ("satoshi-forte.ttf", 66),
    "link-longo": ("satoshi.ttf", 34),
    "dica": ("satoshi.ttf", 40),
    "olho": ("satoshi-medio.ttf", 24),
    "pe": ("satoshi.ttf", 34),
    "org": ("satoshi-medio.ttf", 40),
}

_cache = {}


def fonte(nome):
    if nome not in _cache:
        arquivo, tamanho = ARQUIVOS[nome]
        _cache[nome] = ImageFont.truetype(os.path.join(FONTES, arquivo), tamanho)
    return _cache[nome]


def quebrar(texto, fnt, largura, desenho):
    palavras = texto.split()
    linhas, atual = [], ""
    for palavra in palavras:
        teste = f"{atual} {palavra}".strip()
        if desenho.textlength(teste, font=fnt) <= largura:
            atual = teste
        else:
            if atual:
                linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


def qr_com_logo(url: str, lado: int) -> Image.Image:
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=12, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    imagem = qr.make_image(fill_color=TINTA, back_color="white").convert("RGB")
    imagem = imagem.resize((lado, lado), Image.NEAREST)

    arte = Image.open(ARTE).convert("RGBA")
    alvo = int(lado * 0.28)
    escala = alvo / max(arte.size)
    arte = arte.resize(
        (round(arte.width * escala), round(arte.height * escala)), Image.LANCZOS
    )

    margem = int(alvo * 0.14)
    fundo = Image.new(
        "RGB", (arte.width + margem * 2, arte.height + margem * 2), (255, 255, 255)
    )
    fundo.paste(arte, (margem, margem), arte)

    imagem.paste(
        fundo, ((lado - fundo.width) // 2, (lado - fundo.height) // 2)
    )
    return imagem


def cartaz(sessao: dict, curto: str) -> Image.Image:
    pagina = Image.new("RGB", A4, PAPEL)
    d = ImageDraw.Draw(pagina)
    margem = 130
    largura_util = A4[0] - margem * 2

    # 1. cabeçalho
    d.text(
        (margem, 52),
        "30º ENCONTRO DA RENAP · XI SEMINÁRIO DO IPDMS · 20º DA RENAJU",
        font=fonte("olho"),
        fill=VERMELHO,
    )

    # 2. título grande, na fonte do site
    d.text((margem - 4, 172), "LISTA DE PRESENÇA", font=fonte("titulo"), fill=TINTA)
    d.line([(margem, 420), (A4[0] - margem, 420)], fill=VERMELHO, width=7)

    # 3. atividade
    f_atividade = fonte("atividade")
    y = 470
    linhas = quebrar(sessao["titulo"], f_atividade, largura_util, d)[:4]
    for linha in linhas:
        d.text((margem, y), linha, font=f_atividade, fill=TINTA)
        y += 100

    # 4. dia, hora, sala
    f_info = fonte("info")
    d.text((margem, y + 24), f"{sessao['dia']}/11 · {sessao['semana']} · {sessao['hora']}", font=f_info, fill=FRACA)
    if sessao.get("local"):
        d.text((margem, y + 98), sessao["local"], font=f_info, fill=FRACA)

    # 5. organização
    org = sessao["organizacao"].upper()
    f_org = fonte("org")
    largura_org = d.textlength(org, font=f_org)
    base_org = y + 186
    d.rounded_rectangle(
        [(margem, base_org), (margem + largura_org + 64, base_org + 68)],
        radius=34,
        outline=VERMELHO,
        width=4,
    )
    d.text((margem + 32, base_org + 10), org, font=f_org, fill=VERMELHO)

    # 6. QR grande, ocupando o miolo da folha
    lado = 1700
    qr = qr_com_logo(BASE + sessao["chave"], lado)
    qx = (A4[0] - lado) // 2
    qy = max(base_org + 120, 1000)
    d.rectangle(
        [(qx - 26, qy - 26), (qx + lado + 26, qy + lado + 26)], outline=TINTA, width=4
    )
    pagina.paste(qr, (qx, qy))

    # 7. links: curto primeiro, longo como reserva
    y_link = qy + lado + 80
    if curto:
        f_link = fonte("link")
        largura = d.textlength(curto, font=f_link)
        d.text(((A4[0] - largura) / 2, y_link), curto, font=f_link, fill=TINTA)
        y_link += 92

    f_longo = fonte("link-longo")
    longo = BASE + sessao["chave"]
    largura = d.textlength(longo, font=f_longo)
    d.text(((A4[0] - largura) / 2, y_link), longo, font=f_longo, fill=FRACA)

    dica = "Aponte a câmera. Se não conseguir, digite o endereço acima."
    f_dica = fonte("dica")
    largura = d.textlength(dica, font=f_dica)
    d.text(((A4[0] - largura) / 2, y_link + 60), dica, font=f_dica, fill=FRACA)

    # 8. rodapé
    d.line([(margem, A4[1] - 190), (A4[0] - margem, A4[1] - 190)], fill=LINHA, width=3)
    d.text(
        (margem, A4[1] - 150),
        "Sem login. Se a rede cair, o registro fica no aparelho e sobe sozinho depois.",
        font=fonte("pe"),
        fill=FRACA,
    )
    return pagina


def main():
    sessoes = json.load(io.open(SESSOES, encoding="utf-8"))
    curtos = {}
    if os.path.exists(CURTOS):
        curtos = json.load(io.open(CURTOS, encoding="utf-8"))

    os.makedirs(PASTA_QR, exist_ok=True)
    paginas = []

    for i, sessao in enumerate(sessoes, 1):
        pagina = cartaz(sessao, curtos.get(sessao["chave"], ""))
        paginas.append(pagina)

        qr_com_logo(BASE + sessao["chave"], 1000).save(
            os.path.join(PASTA_QR, f"{sessao['chave']}.png")
        )

        if i % 10 == 0:
            print(f"  {i}/{len(sessoes)} cartazes")

    paginas[0].save(
        PDF,
        "PDF",
        resolution=300.0,
        save_all=True,
        append_images=paginas[1:],
    )

    print(f"pdf: {PDF} ({os.path.getsize(PDF) // 1024 // 1024} MB, {len(paginas)} páginas)")
    print(f"pngs: {PASTA_QR} ({len(sessoes)} arquivos)")


if __name__ == "__main__":
    main()
