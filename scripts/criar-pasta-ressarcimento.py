"""
Cria a pasta de comprovantes no Drive e a aba de ressarcimentos na planilha.

A pasta fica com link aberto para escrita (quem tem o link anexa direto).
A aba `ressarcimentos` recebe uma linha por pedido, com os links dos arquivos.
"""
import io
import json
import os
import urllib.error
import urllib.parse
import urllib.request

CONFIG = os.path.join(os.path.expanduser("~"), ".config", "encontrao")
TOKEN = os.path.join(CONFIG, "google-planilha.json")
PLANILHA = os.path.join(CONFIG, "planilha-id.txt")

CABECALHO = [
    "carimbo",
    "protocolo",
    "nome",
    "estado",
    "organizacao",
    "encontros",
    "pix",
    "valor",
    "comprovantes",
    "links",
    "observacoes",
]


def token_novo():
    with io.open(TOKEN, encoding="utf-8") as arquivo:
        dados = json.load(arquivo)
    corpo = urllib.parse.urlencode(
        {
            "client_id": dados["client_id"],
            "client_secret": dados["client_secret"],
            "refresh_token": dados["refresh_token"],
            "grant_type": "refresh_token",
        }
    ).encode("utf-8")
    req = urllib.request.Request(dados["token_uri"], data=corpo, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resposta:
        return json.loads(resposta.read().decode("utf-8"))["access_token"]


def api(url, token, metodo="GET", corpo=None):
    dados = json.dumps(corpo).encode("utf-8") if corpo is not None else None
    headers = {"authorization": "Bearer " + token}
    if dados:
        headers["content-type"] = "application/json"
    req = urllib.request.Request(url, data=dados, method=metodo, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=40) as resposta:
            texto = resposta.read().decode("utf-8")
            return resposta.status, json.loads(texto) if texto else {}
    except urllib.error.HTTPError as erro:
        return erro.code, erro.read().decode("utf-8", "replace")[:300]


def criar_pasta(token):
    st, pasta = api(
        "https://www.googleapis.com/drive/v3/files?fields=id,webViewLink",
        token,
        "POST",
        {
            "name": "Comprovantes — Ressarcimento · Encontro RENAP 2026",
            "mimeType": "application/vnd.google-apps.folder",
        },
    )
    if st != 200:
        raise SystemExit(f"pasta: {st} {pasta}")
    pasta_id = pasta["id"]
    st, perm = api(
        f"https://www.googleapis.com/drive/v3/files/{pasta_id}/permissions",
        token,
        "POST",
        {"type": "anyone", "role": "writer", "allowFileDiscovery": False},
    )
    if st != 200:
        raise SystemExit(f"permissao: {st} {perm}")
    return pasta_id, pasta.get("webViewLink", "")


def garantir_aba(token, planilha_id):
    st, meta = api(
        f"https://sheets.googleapis.com/v4/spreadsheets/{planilha_id}"
        "?fields=sheets.properties.title",
        token,
    )
    if st != 200:
        raise SystemExit(f"planilha: {st} {meta}")
    abas = [s["properties"]["title"] for s in meta.get("sheets", [])]
    if "ressarcimentos" not in abas:
        st, _ = api(
            f"https://sheets.googleapis.com/v4/spreadsheets/{planilha_id}:batchUpdate",
            token,
            "POST",
            {"requests": [{"addSheet": {"properties": {"title": "ressarcimentos"}}}]},
        )
        if st != 200:
            raise SystemExit(f"addSheet: {st}")
    st, _ = api(
        f"https://sheets.googleapis.com/v4/spreadsheets/{planilha_id}"
        "/values/ressarcimentos!A1:K1?valueInputOption=RAW",
        token,
        "PUT",
        {"values": [CABECALHO]},
    )
    if st != 200:
        raise SystemExit(f"cabecalho: {st}")


def main():
    token = token_novo()
    with io.open(PLANILHA, encoding="utf-8") as arquivo:
        planilha_id = arquivo.read().strip()
    pasta_id, link = criar_pasta(token)
    garantir_aba(token, planilha_id)
    print("pasta_id:", pasta_id)
    print("pasta_link: https://drive.google.com/drive/folders/" + pasta_id + "?usp=sharing")
    print("planilha_id:", planilha_id)


if __name__ == "__main__":
    main()
