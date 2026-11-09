"""
Manda no WhatsApp a programação cultural do encontro, e só ela.

Não manda no Telegram, não entra na fila e não mexe no estado dos avisos
diários: é um disparo avulso. Vai para todos os grupos de
`~/.config/encontrao/whatsapp-grupos.json`, pelo serviço local em
127.0.0.1:8899, um de cada vez.

Uso:
    python scripts/avisar-culturais.py
    python scripts/avisar-culturais.py --seco
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from avisos import comum, textos  # noqa: E402


def main():
    texto = textos.culturais()
    print(texto)
    print("-" * 72)

    if "--seco" in sys.argv:
        print("ensaio: nada enviado")
        return 0

    ok, motivo, falhas = comum.whatsapp_grupos(texto)
    print(f"WhatsApp: {motivo}")
    if falhas:
        print("não receberam: " + ", ".join(a["nome"] for a in falhas))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
