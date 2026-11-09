"""
Encurta os links de check-in no is.gd.

Por que is.gd: é grátis, não pede conta nem chave, e devolve texto puro. O QR
continua apontando para o domínio próprio; o link curto serve para quem for
digitar à mão no cartaz.

Política do serviço: uma requisição por vez, com pausa. 43 links levam ~1 min.
O resultado fica em `.cache/curtos.json`, para o gerador do PDF reaproveitar.
"""
import io
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

UA = "finweejur/github artur colito"
BASE = "https://encontrolenirlivre.pages.dev/c/"
SESSOES = r"X:\DevCoder\OpenCode\encontrolenirlivre\.cache\sessoes.json"
SAIDA = r"X:\DevCoder\OpenCode\encontrolenirlivre\.cache\curtos.json"
PAUSA = 1.4  # segundos entre requisições, acima do mínimo pedido pelo serviço


def encurtar(url: str, tentativas: int = 3) -> str:
    alvo = "https://is.gd/create.php?" + urllib.parse.urlencode(
        {"format": "simple", "url": url}
    )
    req = urllib.request.Request(alvo, headers={"User-Agent": UA})

    for tentativa in range(tentativas):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                texto = r.read().decode("utf-8", "replace").strip()
            if texto.startswith("https://is.gd/"):
                return texto
            print("  resposta inesperada:", texto[:120])
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code} (tentativa {tentativa + 1})")
        except Exception as e:  # noqa: BLE001
            print(f"  erro: {e} (tentativa {tentativa + 1})")
        time.sleep(PAUSA * (tentativa + 2))

    return ""


def main():
    sessoes = json.load(io.open(SESSOES, encoding="utf-8"))

    mapa = {}
    if os.path.exists(SAIDA):
        mapa = json.load(io.open(SAIDA, encoding="utf-8"))
        print("já tinha", len(mapa), "links salvos")

    for i, sessao in enumerate(sessoes, 1):
        chave = sessao["chave"]
        if mapa.get(chave):
            continue

        longo = BASE + chave
        curto = encurtar(longo)
        if curto:
            mapa[chave] = curto
            print(f"{i:2}/{len(sessoes)} {chave} -> {curto}")
        else:
            print(f"{i:2}/{len(sessoes)} {chave} -> falhou")

        io.open(SAIDA, "w", encoding="utf-8").write(
            json.dumps(mapa, ensure_ascii=False, indent=2)
        )
        time.sleep(PAUSA)

    print("total:", len(mapa), "de", len(sessoes))


if __name__ == "__main__":
    main()
