"""
Espelha as presenças do D1 na planilha do Google Sheets.

O check-in grava no Cloudflare D1. Este script puxa o CSV protegido, monta as
colunas com os dados da programação e reescreve a aba `presencas` da planilha.
Reescrever tudo é de propósito: são poucas centenas de linhas e evita
duplicata, linha órfã e controle de estado.

Roda de 2 em 2 minutos pelo Agendador de Tarefas, nesta máquina. O token e o
ID da planilha ficam fora do repositório. Nada de nome ou e-mail no log.

Uso:
    python scripts/espelhar-planilha.py
    python scripts/espelhar-planilha.py --seco
"""
import csv
import io
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from avisos import comum, textos  # noqa: E402

BASE = Path(os.environ.get("USERPROFILE", "."))
TOKEN = BASE / ".config" / "encontrao" / "google-planilha.json"
ID_ARQUIVO = BASE / ".config" / "encontrao" / "planilha-id.txt"

ESCOPOS = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]

CABECALHO = [
    "Quando",
    "Dia",
    "Hora",
    "Atividade",
    "Sala",
    "Rede",
    "Nome",
    "E-mail",
]


def credenciais():
    if not TOKEN.exists():
        raise SystemExit(
            f"falta o token em {TOKEN}. Rode scripts/autenticar-google-planilha.py"
        )
    dados = Credentials.from_authorized_user_file(str(TOKEN), ESCOPOS)
    if not dados.valid:
        dados.refresh(Request())
        TOKEN.write_text(dados.to_json(), encoding="utf-8")
    return dados


def planilha_id():
    if not ID_ARQUIVO.exists():
        raise SystemExit(
            f"falta o ID da planilha em {ID_ARQUIVO}. Rode scripts/criar-planilha.py"
        )
    return ID_ARQUIVO.read_text(encoding="utf-8").strip()


def pedir(metodo, url, cred, corpo=None):
    import json

    dados = json.dumps(corpo).encode("utf-8") if corpo is not None else None
    req = urllib.request.Request(
        url,
        data=dados,
        method=metodo,
        headers={
            "Authorization": f"Bearer {cred.token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resposta:
        texto = resposta.read().decode("utf-8")
        return json.loads(texto) if texto else {}


def quando_br(valor):
    """O D1 devolve UTC; a planilha mostra o horário de Brasília."""
    try:
        data = datetime.strptime(valor, "%Y-%m-%d %H:%M:%S")
        data = data - timedelta(hours=3)
        return data.strftime("%d/%m/%Y %H:%M")
    except ValueError:
        return valor


def linhas():
    token = comum.ler_token()
    if not token:
        raise SystemExit("sem PRESENCA_TOKEN no arquivo local")

    url = f"{comum.SITE}/api/presencas?token={urllib.parse.quote(token)}"
    req = urllib.request.Request(url, headers={"user-agent": comum.UA})
    with urllib.request.urlopen(req, timeout=60) as resposta:
        texto = resposta.read().decode("utf-8")

    mapa = {s["chave"]: s for s in textos.garantir_sessoes()}
    leitor = csv.DictReader(io.StringIO(texto))
    saida = []

    for registro in leitor:
        sessao = registro.get("sessao", "")
        info = mapa.get(sessao, {})
        dia = info.get("dia", "")
        saida.append(
            (
                registro.get("quando", ""),
                [
                    quando_br(registro.get("quando", "")),
                    f"{dia}/11" if dia else "",
                    info.get("hora", ""),
                    registro.get("titulo") or info.get("titulo", ""),
                    info.get("local") or "",
                    info.get("organizacao", ""),
                    registro.get("nome", ""),
                    registro.get("email", ""),
                ],
            )
        )

    # Ordem cronológica pelo horário original do D1.
    saida.sort(key=lambda par: par[0])
    return [linha for _, linha in saida]


def escrever(cred, identificador, dados):
    base = f"https://sheets.googleapis.com/v4/spreadsheets/{identificador}"
    pedir("POST", f"{base}/values/presencas!A2:H:clear", cred, {})
    if dados:
        pedir(
            "PUT",
            f"{base}/values/presencas!A2:H{len(dados) + 1}?valueInputOption=RAW",
            cred,
            {"values": dados},
        )


def main():
    dados = linhas()
    if "--seco" in sys.argv:
        print(f"{len(dados)} linha(s) no CSV")
        for linha in dados[:3]:
            print("  ", linha[0], linha[1], linha[3][:50], "…")
        return 0

    cred = credenciais()
    identificador = planilha_id()
    escrever(cred, identificador, dados)
    print(f"{len(dados)} linha(s) espelhada(s) na planilha {identificador}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
