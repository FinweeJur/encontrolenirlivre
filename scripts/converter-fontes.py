"""Converte as fontes woff2 do site para ttf, para o Pillow usar no PDF."""
import os

from fontTools.ttLib import TTFont

PROJ = r"X:\DevCoder\OpenCode\encontrolenirlivre"
SAIDA = os.path.join(PROJ, ".cache", "fonts")

FONTES = {
    "zodiak": "zodiak-700.woff2",
    "satoshi-forte": "satoshi-700.woff2",
    "satoshi": "satoshi-400.woff2",
    "satoshi-medio": "satoshi-500.woff2",
}

os.makedirs(SAIDA, exist_ok=True)

for nome, arquivo in FONTES.items():
    origem = os.path.join(PROJ, "public", "fonts", arquivo)
    destino = os.path.join(SAIDA, f"{nome}.ttf")
    fonte = TTFont(origem)
    fonte.flavor = None
    fonte.save(destino)
    print(nome, "->", destino, os.path.getsize(destino) // 1024, "KB")
