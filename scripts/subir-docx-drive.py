"""
Sobe um .docx para o Google Drive e converte em Google Docs.

Usa o mesmo OAuth já configurado para a planilha do encontro
(`~/.config/encontrao/google-planilha.json`), com escopo `drive.file`.
O arquivo nasce na conta do dono e o link fica no stdout.

Uso:
    python scripts/subir-docx-drive.py public/entrega-encontro/mensagens-avisos.docx
    python scripts/subir-docx-drive.py arquivo.docx --nome "Outro nome"
"""
import argparse
import io
import json
import os
import urllib.error
import urllib.parse
import urllib.request
import uuid

TOKEN_PADRAO = os.path.join(
    os.path.expanduser("~"), ".config", "encontrao", "google-planilha.json"
)
MIME_DOCX = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)
MIME_DOC = "application/vnd.google-apps.document"


def access_token(caminho):
    with io.open(caminho, encoding="utf-8") as arquivo:
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
        novo = json.loads(resposta.read().decode("utf-8"))
    return novo["access_token"]


def enviar(caminho, nome, token):
    with io.open(caminho, "rb") as arquivo:
        conteudo = arquivo.read()

    limite = "===============docx" + uuid.uuid4().hex
    metadados = json.dumps({"name": nome, "mimeType": MIME_DOC}).encode("utf-8")
    corpo = (
        ("--" + limite + "\r\n").encode("utf-8")
        + b"Content-Type: application/json; charset=UTF-8\r\n\r\n"
        + metadados
        + b"\r\n"
        + ("--" + limite + "\r\n").encode("utf-8")
        + ("Content-Type: " + MIME_DOCX + "\r\n\r\n").encode("utf-8")
        + conteudo
        + b"\r\n"
        + ("--" + limite + "--\r\n").encode("utf-8")
    )
    url = (
        "https://www.googleapis.com/upload/drive/v3/files"
        "?uploadType=multipart&fields=id,name,webViewLink"
    )
    req = urllib.request.Request(
        url,
        data=corpo,
        method="POST",
        headers={
            "authorization": "Bearer " + token,
            "content-type": "multipart/related; boundary=" + limite,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resposta:
            return json.loads(resposta.read().decode("utf-8"))
    except urllib.error.HTTPError as erro:
        detalhe = erro.read().decode("utf-8", "replace")[:400]
        raise SystemExit(f"Drive {erro.code}: {detalhe}")


def main():
    parser = argparse.ArgumentParser(description="Sobe .docx como Google Doc.")
    parser.add_argument("arquivo")
    parser.add_argument("--nome", default="")
    parser.add_argument("--token", default=TOKEN_PADRAO)
    args = parser.parse_args()

    nome = args.nome or os.path.splitext(os.path.basename(args.arquivo))[0]
    token = access_token(args.token)
    dados = enviar(args.arquivo, nome, token)
    print("id:", dados.get("id"))
    print("link:", dados.get("webViewLink"))


if __name__ == "__main__":
    main()
