"""
Gera o .docx com todas as mensagens dos avisos do encontro.

Fonte: `scripts/avisos/textos.py`, a mesma que alimenta o Telegram e o
WhatsApp. Assim o documento de revisão não divergge do que vai ser enviado.

Uso:
    python scripts/gerar-docx-mensagens.py
    python scripts/gerar-docx-mensagens.py --saida outra/pasta.docx
"""
import argparse
import os
import sys

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, RGBColor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from avisos import comum, textos  # noqa: E402

SAIDA_PADRAO = os.path.join(
    comum.RAIZ, "public", "entrega-encontro", "mensagens-avisos.docx"
)

DIAS = [
    ("9", "Domingo, 9/11 — véspera"),
    ("10", "Segunda, 10/11 — véspera"),
    ("11", "Quarta, 11/11 — 1º dia"),
    ("12", "Quinta, 12/11 — 2º dia"),
    ("13", "Sexta, 13/11 — 3º dia"),
    ("14", "Sábado, 14/11 — 4º dia"),
]


def texto_do_dia(dia):
    """Manhã e noite do dia, na mesma regra do avisador."""
    manha = (
        textos.bom_dia_antes(dia)
        if dia in ("9", "10")
        else textos.resumo_dia(dia)
    )
    return manha, textos.boa_noite(dia)


def paragrafo(doc, texto, tamanho=11, cor=None, negrito=False):
    p = doc.add_paragraph()
    run = p.add_run(texto)
    run.font.size = Pt(tamanho)
    run.bold = negrito
    if cor:
        run.font.color.rgb = cor
    p.paragraph_format.space_after = Pt(6)
    return p


def main():
    parser = argparse.ArgumentParser(description="Gera o .docx das mensagens.")
    parser.add_argument("--saida", default=SAIDA_PADRAO)
    args = parser.parse_args()

    doc = Document()
    estilo = doc.styles["Normal"]
    estilo.font.name = "Calibri"
    estilo.font.size = Pt(11)

    titulo = doc.add_heading("Mensagens dos avisos", level=0)
    titulo.alignment = WD_ALIGN_PARAGRAPH.LEFT

    paragrafo(
        doc,
        "30º Encontro Nacional da RENAP · XI Seminário do IPDMS · "
        "20º Encontro da RENAJU",
        tamanho=12,
        negrito=True,
    )
    paragrafo(doc, "João Pessoa, 11 a 14 de novembro de 2026", tamanho=11)
    paragrafo(
        doc,
        "Estes textos foram preparados com ajuda de IA. "
        "Revisem horários, salas, nomes das atividades e tom antes do envio.",
        tamanho=10,
        cor=RGBColor(0x80, 0x80, 0x80),
    )
    paragrafo(
        doc,
        f"Encontro: {comum.PROGRAMA}\nSeminário: {comum.PROGRAMA_SEMINARIO}",
        tamanho=10,
    )

    for dia, rotulo in DIAS:
        manha, noite = texto_do_dia(dia)
        doc.add_page_break()
        doc.add_heading(rotulo, level=1)
        doc.add_heading("Aviso da manhã (07h)", level=2)
        paragrafo(doc, manha)
        doc.add_heading("Aviso da noite (19h)", level=2)
        paragrafo(doc, noite)

    doc.add_page_break()
    doc.add_heading("Programação cultural (WhatsApp)", level=1)
    paragrafo(doc, textos.culturais())

    doc.add_heading("Lembrete de pagamento", level=1)
    paragrafo(doc, textos.pagamento())

    doc.add_heading("Exemplo de aviso de check-in", level=1)
    paragrafo(
        doc,
        textos.texto_marco(
            50, "GD3 — Sistema de justiça e conflitos fundiários", "13h às 16h30"
        ),
    )

    rodape = doc.sections[0].footer.paragraphs[0]
    rodape.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = rodape.add_run(
        f"Encontro: {comum.PROGRAMA}  |  Seminário: {comum.PROGRAMA_SEMINARIO}"
    )
    run.font.size = Pt(8)
    run.font.color.rgb = RGBColor(0x80, 0x80, 0x80)

    os.makedirs(os.path.dirname(args.saida), exist_ok=True)
    doc.save(args.saida)
    print(args.saida)
    print(f"{os.path.getsize(args.saida) // 1024} KB")


if __name__ == "__main__":
    main()
