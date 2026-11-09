"""
Gera as listas de presença físicas do encontro, uma por dia, em .docx.

Por que existem: o check-in digital é a fonte principal, mas papel não cai com
a rede. A lista impressa é a redundância — nome, e-mail, rede, turno e
assinatura — para conferir depois e digitar o que faltar.

Layout pensado para A4 e caneta:
  - nome com 6 cm e assinatura com 4,5 cm;
  - linha de 1,05 cm, que cabe folgado e ainda deixa 70+ assinaturas;
  - cabeçalho da tabela repetido em cada página;
  - resumo do dia no topo, com horário, atividade e sala.

As logos da RENAP e do IPDMS saem de `public/img`. A marca da RENAJU veio
do PDF oficial de trabalhos aprovados do IPDMS e está em
`public/img/renaju-logo.png`; se a organização enviar outra versão, basta
substituir o arquivo. Sem ele, o gerador desenha um letreiro tipográfico.

Fonte da programação: `src/content/programacaoDetalhada.ts`, via
`scripts/avisos/textos.py`. Nada de horário digitado duas vezes.
"""
import argparse
import os
import sys

from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL, WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from avisos import textos  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, "listas-presenca")
CACHE = os.path.join(RAIZ, ".cache")

LOGO_RENAP = os.path.join(RAIZ, "public", "img", "logo-ink.png")
LOGO_IPDMS = os.path.join(RAIZ, "public", "img", "ipdms-logo.png")
LOGO_RENAJU = os.path.join(RAIZ, "public", "img", "renaju-logo.png")
MARCA_RENAJU = os.path.join(CACHE, "renaju-marca.png")

TINTA = RGBColor(0x2A, 0x25, 0x21)
TINTA_FRACA = RGBColor(0x6D, 0x61, 0x53)
VERMELHO = RGBColor(0xBF, 0x2A, 0x26)
LINHA = "C9BDA6"
PAPEL = "F6F1E7"
PAPEL_2 = "EFE6D4"

DIAS = {
    "11": ("quarta-feira", "11 de novembro de 2026", "11/11/2026"),
    "12": ("quinta-feira", "12 de novembro de 2026", "12/11/2026"),
    "13": ("sexta-feira", "13 de novembro de 2026", "13/11/2026"),
    "14": ("sábado", "14 de novembro de 2026", "14/11/2026"),
}

LINHAS_POR_FOLHA = 72


# --------------------------------------------------------------------- texto


def _predio(local):
    """Nome curto do prédio, para o resumo impresso não virar um mapa."""
    texto = str(local or "")
    if "CCHLA" in texto:
        return "CCHLA"
    if "Auditório do CT" in texto or " CT" in texto:
        return "CT"
    if "CCSA" in texto:
        return "CCSA"
    if "CCJ" in texto or "PPGCJ" in texto:
        return "CCJ"
    if "Armazém" in texto:
        return "Armazém do Campo"
    if "OAB" in texto:
        return "OAB/PB"
    if "Centro da cidade" in texto:
        return "Centro"
    return textos.local_curto(texto)


def resumo_do_dia(dia):
    """Uma linha por bloco de horário: “13h às 16h30 — GDs 1, 3… (CCJ/CCSA)”."""
    itens = textos.por_dia().get(dia, [])
    ordem = []
    grupos = {}
    for item in itens:
        if item["hora"] not in grupos:
            ordem.append(item["hora"])
            grupos[item["hora"]] = []
        grupos[item["hora"]].append(item)

    linhas = []
    for hora in ordem:
        grupo = grupos[hora]
        rotulo = hora if textos._minutos(hora) is not None else hora.capitalize()

        if len(grupo) > 1 and all(i["titulo"].startswith("GD") for i in grupo):
            numeros = sorted({n for i in grupo for n in textos.numeros_gd(i["titulo"])})
            atividade = "GDs " + textos.juntar([str(n) for n in numeros])
        elif len(grupo) > 1 and all(i["titulo"].startswith("Oficina") for i in grupo):
            atividade = f"Oficinas ({len(grupo)} opções)"
        elif len(grupo) > 1 and all("Plenária" in i["titulo"] for i in grupo):
            atividade = "Plenárias da RENAP e da RENAJU"
        elif len(grupo) >= 3:
            redes = [
                rede
                for rede in ("RENAP", "RENAJU", "IPDMS")
                if any(i["titulo"].startswith(rede) for i in grupo)
            ]
            oficinas = sum(1 for i in grupo if i["titulo"].startswith("Oficina"))
            partes = redes[:]
            if oficinas:
                partes.append(f"{oficinas} oficinas")
            atividade = textos.juntar(partes) or f"{len(grupo)} atividades"
        elif (
            len(grupo) == 2
            and any(i["titulo"].startswith("Plenária") for i in grupo)
            and any(i["titulo"].startswith("RENAJU") for i in grupo)
        ):
            atividade = "Plenária do IPDMS e atividade da RENAJU"
        elif len(grupo) == 1:
            atividade = textos.titulo_limpo(grupo[0]["titulo"])
        else:
            atividade = " / ".join(
                textos.titulo_limpo(i["titulo"]).split(":")[0] for i in grupo
            )

        if len(grupo) > 1:
            predios = []
            for item in grupo:
                predio = _predio(item.get("local"))
                if predio and predio not in predios:
                    predios.append(predio)
            local = textos.juntar(predios)
        else:
            local = textos.local_curto(grupo[0].get("local"))
        linha = f"{rotulo} — {atividade}"
        if local:
            linha += f" · {local}"
        linhas.append(linha)

    return linhas


# ------------------------------------------------------------------- imagem


def fonte(caminho, tamanho):
    try:
        return ImageFont.truetype(caminho, tamanho)
    except OSError:
        return ImageFont.load_default()


def marca_renaju():
    """Letreiro tipográfico, usado só enquanto não houver marca oficial."""
    if os.path.exists(LOGO_RENAJU):
        return LOGO_RENAJU

    os.makedirs(CACHE, exist_ok=True)
    largura, altura = 760, 500
    imagem = Image.new("RGBA", (largura, altura), (0, 0, 0, 0))
    desenho = ImageDraw.Draw(imagem)

    negrito = fonte(r"C:\Windows\Fonts\arialbd.ttf", 130)
    normal = fonte(r"C:\Windows\Fonts\arial.ttf", 30)

    texto = "RENAJU"
    espaco = 10
    larguras = [desenho.textlength(c, font=negrito) for c in texto]
    total = sum(larguras) + espaco * (len(texto) - 1)
    x = (largura - total) / 2
    for caractere, largura_caractere in zip(texto, larguras):
        desenho.text((x, 70), caractere, font=negrito, fill=(42, 37, 33, 255))
        x += largura_caractere + espaco

    desenho.rectangle([(170, 250), (largura - 170, 255)], fill=(191, 42, 38, 255))

    for indice, linha in enumerate(
        ("REDE NACIONAL DE ASSESSORIA", "JURÍDICA UNIVERSITÁRIA")
    ):
        largura_linha = desenho.textlength(linha, font=normal)
        desenho.text(
            ((largura - largura_linha) / 2, 280 + indice * 42),
            linha,
            font=normal,
            fill=(70, 62, 52, 255),
        )

    imagem.save(MARCA_RENAJU)
    return MARCA_RENAJU


# --------------------------------------------------------------- docx helpers


def sem_bordas(tabela):
    _bordas_tabela(tabela, None)


def bordas_tabela(tabela, cor=LINHA, tamanho=4):
    _bordas_tabela(tabela, (cor, tamanho))


def _bordas_tabela(tabela, especificacao):
    tbl_pr = tabela._tbl.tblPr
    for existente in tbl_pr.findall(qn("w:tblBorders")):
        tbl_pr.remove(existente)
    bordas = OxmlElement("w:tblBorders")
    for borda in ("top", "left", "bottom", "right", "insideH", "insideV"):
        elemento = OxmlElement(f"w:{borda}")
        if especificacao is None:
            elemento.set(qn("w:val"), "nil")
        else:
            cor, tamanho = especificacao
            elemento.set(qn("w:val"), "single")
            elemento.set(qn("w:sz"), str(tamanho))
            elemento.set(qn("w:space"), "0")
            elemento.set(qn("w:color"), cor)
        bordas.append(elemento)
    _inserir_tbl(tbl_pr, bordas)


ORDEM_TBL = [
    "w:tblStyle",
    "w:tblpPr",
    "w:tblOverlap",
    "w:bidiVisual",
    "w:tblStyleRowBandSize",
    "w:tblStyleColBandSize",
    "w:tblW",
    "w:jc",
    "w:tblCellSpacing",
    "w:tblInd",
    "w:tblBorders",
    "w:shd",
    "w:tblLayout",
    "w:tblCellMar",
    "w:tblLook",
]

ORDEM_TC = [
    "w:cnfStyle",
    "w:tcW",
    "w:gridSpan",
    "w:hMerge",
    "w:vMerge",
    "w:tcBorders",
    "w:shd",
    "w:noWrap",
    "w:tcMar",
    "w:textDirection",
    "w:tcFitText",
    "w:vAlign",
    "w:hideMark",
]

ORDEM_P = [
    "w:pStyle",
    "w:keepNext",
    "w:keepLines",
    "w:pageBreakBefore",
    "w:framePr",
    "w:widowControl",
    "w:numPr",
    "w:suppressLineNumbers",
    "w:pBdr",
    "w:shd",
    "w:tabs",
    "w:suppressAutoHyphens",
    "w:kinsoku",
    "w:wordWrap",
    "w:overflowPunct",
    "w:topLinePunct",
    "w:autoSpaceDE",
    "w:autoSpaceDN",
    "w:bidi",
    "w:adjustRightInd",
    "w:snapToGrid",
    "w:spacing",
    "w:ind",
    "w:contextualSpacing",
    "w:mirrorIndents",
    "w:suppressOverlap",
    "w:jc",
]


def _inserir(ordem, pai, elemento):
    tag = elemento.tag
    for existente in pai.findall(tag):
        pai.remove(existente)
    indice = next(i for i, nome in enumerate(ordem) if qn(nome) == tag)
    sucessores = {qn(nome) for nome in ordem[indice + 1 :]}
    for filho in pai:
        if filho.tag in sucessores:
            filho.addprevious(elemento)
            return
    pai.append(elemento)


def _inserir_tbl(tbl_pr, elemento):
    _inserir(ORDEM_TBL, tbl_pr, elemento)


def _inserir_tc(tc_pr, elemento):
    _inserir(ORDEM_TC, tc_pr, elemento)


def _inserir_p(p_pr, elemento):
    _inserir(ORDEM_P, p_pr, elemento)


def largura_tabela(tabela, cm):
    tbl_pr = tabela._tbl.tblPr
    largura = OxmlElement("w:tblW")
    largura.set(qn("w:w"), str(int(cm * 567)))
    largura.set(qn("w:type"), "dxa")
    _inserir_tbl(tbl_pr, largura)
    layout = OxmlElement("w:tblLayout")
    layout.set(qn("w:type"), "fixed")
    _inserir_tbl(tbl_pr, layout)


def bordas_celula(celula, especificacao):
    """especificacao: {"left": (24, "BF2A26"), "top": (4, LINHA), ...}."""
    tc_pr = celula._tc.get_or_add_tcPr()
    bordas = OxmlElement("w:tcBorders")
    for lado, (tamanho, cor) in especificacao.items():
        elemento = OxmlElement(f"w:{lado}")
        elemento.set(qn("w:val"), "single")
        elemento.set(qn("w:sz"), str(tamanho))
        elemento.set(qn("w:space"), "0")
        elemento.set(qn("w:color"), cor)
        bordas.append(elemento)
    _inserir_tc(tc_pr, bordas)


def sombra(celula, cor):
    tc_pr = celula._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), cor)
    _inserir_tc(tc_pr, shd)


def margens_celula(celula, topo=0.05, esquerda=0.12, baixo=0.05, direita=0.08):
    tc_pr = celula._tc.get_or_add_tcPr()
    margens = OxmlElement("w:tcMar")
    for lado, valor in (
        ("top", topo),
        ("left", esquerda),
        ("bottom", baixo),
        ("right", direita),
    ):
        elemento = OxmlElement(f"w:{lado}")
        elemento.set(qn("w:w"), str(int(valor * 567)))
        elemento.set(qn("w:type"), "dxa")
        margens.append(elemento)
    _inserir_tc(tc_pr, margens)


def borda_paragrafo(paragrafo, lado, tamanho, cor):
    p_pr = paragrafo._p.get_or_add_pPr()
    bordas = OxmlElement("w:pBdr")
    elemento = OxmlElement(f"w:{lado}")
    elemento.set(qn("w:val"), "single")
    elemento.set(qn("w:sz"), str(tamanho))
    elemento.set(qn("w:space"), "4")
    elemento.set(qn("w:color"), cor)
    bordas.append(elemento)
    _inserir_p(p_pr, bordas)


def altura_linha(linha, cm):
    linha.height = Cm(cm)
    linha.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY


def repetir_cabecalho(linha):
    tr_pr = linha._tr.get_or_add_trPr()
    elemento = OxmlElement("w:tblHeader")
    elemento.set(qn("w:val"), "true")
    tr_pr.append(elemento)


def nao_quebrar(linha):
    tr_pr = linha._tr.get_or_add_trPr()
    tr_pr.append(OxmlElement("w:cantSplit"))


def campo(paragrafo, nome):
    """Campo de página; Word e LibreOffice atualizam ao abrir."""
    run = paragrafo.add_run()
    inicio = OxmlElement("w:fldChar")
    inicio.set(qn("w:fldCharType"), "begin")
    run._r.append(inicio)

    run = paragrafo.add_run()
    instrucao = OxmlElement("w:instrText")
    instrucao.set(qn("xml:space"), "preserve")
    instrucao.text = nome
    run._r.append(instrucao)

    run = paragrafo.add_run()
    separador = OxmlElement("w:fldChar")
    separador.set(qn("w:fldCharType"), "separate")
    run._r.append(separador)

    paragrafo.add_run("1").font.size = Pt(7)

    run = paragrafo.add_run()
    fim = OxmlElement("w:fldChar")
    fim.set(qn("w:fldCharType"), "end")
    run._r.append(fim)


def paragrafo(doc, texto="", tamanho=9, negrito=False, cor=TINTA, alinhamento=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.0
    if alinhamento is not None:
        p.alignment = alinhamento
    if texto:
        run = p.add_run(texto)
        run.bold = negrito
        run.font.size = Pt(tamanho)
        run.font.color.rgb = cor
        run.font.name = "Arial"
    return p


# ------------------------------------------------------------------- desenho


def desenhar(doc, dia):
    semana, data_extenso, data_curta = DIAS[dia]

    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(1.3)
    section.bottom_margin = Cm(1.1)
    section.left_margin = Cm(1.4)
    section.right_margin = Cm(1.4)
    section.header_distance = Cm(0.55)
    section.footer_distance = Cm(0.45)

    # Cabeçalho repetido em todas as páginas.
    cabecalho = section.header.paragraphs[0]
    cabecalho.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cabecalho.paragraph_format.space_after = Pt(0)
    run = cabecalho.add_run(
        "30º Encontro Nacional da RENAP  ·  XI Seminário do IPDMS  ·  "
        "20º Encontro da RENAJU  ·  "
    )
    run.font.size = Pt(7)
    run.font.color.rgb = TINTA_FRACA
    run.font.name = "Arial"
    run = cabecalho.add_run(f"Lista de presença — {data_curta}")
    run.font.size = Pt(7)
    run.bold = True
    run.font.color.rgb = VERMELHO
    run.font.name = "Arial"

    borda_paragrafo(cabecalho, "bottom", 4, LINHA)

    # Rodapé com número de página.
    rodape = section.footer.paragraphs[0]
    rodape.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rodape.paragraph_format.space_after = Pt(0)
    run = rodape.add_run(f"Lista de presença · {data_extenso} · página ")
    run.font.size = Pt(7)
    run.font.color.rgb = TINTA_FRACA
    run.font.name = "Arial"
    campo(rodape, "PAGE")
    run = rodape.add_run(" de ")
    run.font.size = Pt(7)
    run.font.color.rgb = TINTA_FRACA
    run.font.name = "Arial"
    campo(rodape, "NUMPAGES")

    # Logos.
    paragrafo(
        doc,
        "REALIZAÇÃO",
        tamanho=6,
        negrito=True,
        cor=TINTA_FRACA,
        alinhamento=WD_ALIGN_PARAGRAPH.CENTER,
    )
    logos = doc.add_table(rows=1, cols=3)
    logos.alignment = WD_TABLE_ALIGNMENT.CENTER
    logos.autofit = False
    sem_bordas(logos)
    largura_tabela(logos, 18.2)
    larguras_logo = [Cm(6.0), Cm(6.2), Cm(6.0)]
    for indice, largura in enumerate(larguras_logo):
        logos.columns[indice].width = largura
        logos.rows[0].cells[indice].width = largura
    altura_linha(logos.rows[0], 2.35)

    for celula in logos.rows[0].cells:
        celula.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        celula.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        celula.paragraphs[0].paragraph_format.space_after = Pt(0)

    imagens = [
        (logos.rows[0].cells[0], LOGO_RENAP, Cm(2.05)),
        (logos.rows[0].cells[1], marca_renaju(), Cm(2.25)),
        (logos.rows[0].cells[2], LOGO_IPDMS, Cm(2.0)),
    ]
    for celula, caminho, largura in imagens:
        run = celula.paragraphs[0].add_run()
        run.add_picture(caminho, width=largura)

    # Nome completo do evento.
    for titulo in (
        "30º ENCONTRO NACIONAL DA RENAP",
        "XI SEMINÁRIO NACIONAL DO IPDMS",
        "20º ENCONTRO NACIONAL DA RENAJU",
    ):
        paragrafo(
            doc,
            titulo,
            tamanho=10,
            negrito=True,
            alinhamento=WD_ALIGN_PARAGRAPH.CENTER,
        )

    for organizacao in (
        "RENAP — Rede Nacional de Advogadas e Advogados Populares",
        "IPDMS — Instituto de Pesquisa, Direitos e Movimentos Sociais",
        "RENAJU — Rede Nacional de Assessoria Jurídica Universitária",
    ):
        paragrafo(
            doc,
            organizacao,
            tamanho=6.5,
            cor=TINTA_FRACA,
            alinhamento=WD_ALIGN_PARAGRAPH.CENTER,
        )

    p = paragrafo(
        doc,
        "Lenir Correia Livre  ·  Venas abiertas: pesquisas e insurgências na "
        "América Latina  ·  Memórias e dilemas renajupianos",
        tamanho=7.5,
        cor=TINTA_FRACA,
        alinhamento=WD_ALIGN_PARAGRAPH.CENTER,
    )
    p.runs[0].italic = True

    paragrafo(
        doc,
        "11 a 14 de novembro de 2026  ·  UFPB, Campus I  ·  João Pessoa/PB",
        tamanho=8,
        alinhamento=WD_ALIGN_PARAGRAPH.CENTER,
    )

    # Título da folha.
    p = paragrafo(
        doc,
        "LISTA DE PRESENÇA",
        tamanho=19,
        negrito=True,
        alinhamento=WD_ALIGN_PARAGRAPH.CENTER,
    )
    p.paragraph_format.space_before = Pt(6)
    borda_paragrafo(p, "bottom", 16, "BF2A26")

    p = paragrafo(
        doc,
        f"{semana.capitalize()}, {data_extenso}",
        tamanho=12,
        negrito=True,
        alinhamento=WD_ALIGN_PARAGRAPH.CENTER,
    )
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(4)

    # Resumo do dia.
    resumo = doc.add_table(rows=1, cols=1)
    resumo.alignment = WD_TABLE_ALIGNMENT.CENTER
    resumo.autofit = False
    largura_tabela(resumo, 18.2)
    resumo.columns[0].width = Cm(18.2)
    celula = resumo.rows[0].cells[0]
    celula.width = Cm(18.2)
    sombra(celula, PAPEL)
    bordas_celula(
        celula,
        {
            "left": (24, "BF2A26"),
            "top": (4, LINHA),
            "bottom": (4, LINHA),
            "right": (4, LINHA),
        },
    )
    margens_celula(celula, topo=0.14, esquerda=0.22, baixo=0.12, direita=0.18)

    p = celula.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run("RESUMO DO DIA")
    run.bold = True
    run.font.size = Pt(6.8)
    run.font.color.rgb = VERMELHO
    run.font.name = "Arial"

    for linha in resumo_do_dia(dia):
        hora, _, resto = linha.partition(" — ")
        p = celula.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.left_indent = Cm(0.05)
        run = p.add_run(f"{hora}  ")
        run.bold = True
        run.font.size = Pt(7.3)
        run.font.color.rgb = TINTA
        run.font.name = "Arial"
        run = p.add_run(resto)
        run.font.size = Pt(7.3)
        run.font.color.rgb = TINTA
        run.font.name = "Arial"

    # Campos de identificação.
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(5)
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run("Atividade / sala: ")
    run.bold = True
    run.font.size = Pt(8.2)
    run.font.name = "Arial"
    run = p.add_run("_" * 94)
    run.font.size = Pt(8.2)
    run.font.name = "Arial"

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(0)
    for texto, sublinhado in (
        ("Responsável pela lista: ", 40),
        ("      Contato: ", 30),
    ):
        run = p.add_run(texto)
        run.bold = True
        run.font.size = Pt(8.2)
        run.font.name = "Arial"
        run = p.add_run("_" * sublinhado)
        run.font.size = Pt(8.2)
        run.font.name = "Arial"

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    for texto, sublinhado in (
        ("Local: ", 45),
        (f"      Data: {data_curta}", 0),
    ):
        run = p.add_run(texto)
        run.bold = True
        run.font.size = Pt(8.2)
        run.font.name = "Arial"
        if sublinhado:
            run = p.add_run("_" * sublinhado)
            run.font.size = Pt(8.2)
            run.font.name = "Arial"

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    run = p.add_run(
        "Marque X no turno em que a pessoa participou. Use letra legível. "
        "Rede: R = RENAP · I = IPDMS · J = RENAJU."
    )
    run.font.size = Pt(7.2)
    run.italic = True
    run.font.color.rgb = TINTA_FRACA
    run.font.name = "Arial"

    # Tabela de assinaturas.
    tabela = doc.add_table(rows=1, cols=7)
    tabela.alignment = WD_TABLE_ALIGNMENT.CENTER
    tabela.autofit = False
    bordas_tabela(tabela, cor=LINHA, tamanho=4)
    largura_tabela(tabela, 18.2)

    larguras = [Cm(0.7), Cm(6.0), Cm(3.8), Cm(1.0), Cm(1.1), Cm(1.1), Cm(4.5)]
    for indice, largura in enumerate(larguras):
        tabela.columns[indice].width = largura

    cabecalho_tabela = tabela.rows[0]
    altura_linha(cabecalho_tabela, 0.9)
    repetir_cabecalho(cabecalho_tabela)
    nao_quebrar(cabecalho_tabela)

    rotulos = ["Nº", "Nome completo", "E-mail", "Rede", "Manhã", "Tarde", "Assinatura"]
    for indice, rotulo in enumerate(rotulos):
        celula = cabecalho_tabela.cells[indice]
        celula.width = larguras[indice]
        celula.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        sombra(celula, PAPEL_2)
        margens_celula(celula)
        p = celula.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(rotulo)
        run.bold = True
        run.font.size = Pt(7.2)
        run.font.name = "Arial"
        run.font.color.rgb = VERMELHO if rotulo in ("Manhã", "Tarde") else TINTA
        if rotulo == "Rede":
            run.add_break()
            run = p.add_run("R · I · J")
            run.font.size = Pt(5.8)
            run.font.color.rgb = TINTA_FRACA
            run.font.name = "Arial"

    for numero in range(1, LINHAS_POR_FOLHA + 1):
        linha = tabela.add_row()
        altura_linha(linha, 1.05)
        nao_quebrar(linha)
        for indice in range(7):
            celula = linha.cells[indice]
            celula.width = larguras[indice]
            celula.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            margens_celula(celula)
            if numero % 2 == 0:
                sombra(celula, "FBF8F1")
            p = celula.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            if indice == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run(str(numero))
                run.font.size = Pt(8)
                run.font.color.rgb = TINTA_FRACA
                run.font.name = "Arial"
            elif indice in (4, 5):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run("□")
                run.font.size = Pt(10)
                run.font.color.rgb = RGBColor(0xB0, 0xA8, 0x9A)
                run.font.name = "Arial"
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT

    # Fecho.
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(
        "Total de presenças registradas: __________      "
        "Conferido por: ______________________________"
    )
    run.font.size = Pt(8)
    run.bold = True
    run.font.name = "Arial"

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run(
        "Recolher esta lista ao fim do dia. Documento de redundância do "
        "check-in digital — encontrolenirlivre.pages.dev"
    )
    run.font.size = Pt(6.8)
    run.italic = True
    run.font.color.rgb = TINTA_FRACA
    run.font.name = "Arial"


def gerar(dia):
    doc = Document()
    doc.styles["Normal"].font.name = "Arial"
    doc.styles["Normal"].font.size = Pt(9)
    doc.styles["Normal"].font.color.rgb = TINTA

    desenhar(doc, dia)

    semana, data_extenso, data_curta = DIAS[dia]
    doc.core_properties.title = f"Lista de presença — {data_extenso}"
    doc.core_properties.author = "RENAP · IPDMS · RENAJU"
    doc.core_properties.subject = (
        "30º Encontro Nacional da RENAP · XI Seminário Nacional do IPDMS · "
        "20º Encontro Nacional da RENAJU"
    )
    doc.core_properties.keywords = "lista de presença, check-in, encontro 2026"
    doc.core_properties.comments = (
        "Redundância física do check-in digital. Gerado a partir da programação "
        "oficial do encontro."
    )

    os.makedirs(SAIDA, exist_ok=True)
    caminho = os.path.join(SAIDA, f"lista-presenca-{data_curta.replace('/', '-')}.docx")
    doc.save(caminho)
    return caminho


def main():
    parser = argparse.ArgumentParser(description="Listas de presença em .docx.")
    parser.add_argument("--dia", choices=["11", "12", "13", "14"], help="gerar só um dia")
    args = parser.parse_args()

    dias = [args.dia] if args.dia else ["11", "12", "13", "14"]
    for dia in dias:
        caminho = gerar(dia)
        print(f"{caminho} — {os.path.getsize(caminho) // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
