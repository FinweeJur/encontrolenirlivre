"""
Cria a planilha do espelho de presenças no Google Sheets.

A planilha nasce privada, na conta que autorizou o fluxo
`autenticar-google-planilha.py`. Duas abas:

  presencas  uma linha por check-in, com quando, dia, hora, atividade, sala,
             rede, nome e e-mail;
  resumo     total e contagem por atividade, com fórmula QUERY.

O ID fica fora do repositório, em
`%USERPROFILE%\\.config\\encontrao\\planilha-id.txt`. O script é idempotente:
se a planilha já existir, reaproveita e garante o cabeçalho.

Uso:
    python scripts/criar-planilha.py
"""
import io
import json
import os
import urllib.error
import urllib.request
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

ESCOPOS = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]
BASE = Path(os.environ.get("USERPROFILE", "."))
TOKEN = BASE / ".config" / "encontrao" / "google-planilha.json"
ID_ARQUIVO = BASE / ".config" / "encontrao" / "planilha-id.txt"

TITULO = (
    "Presenças — 30º Encontro da RENAP · XI Seminário do IPDMS · "
    "20º Encontro da RENAJU 2026"
)
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
NOTA = "Fonte: check-in digital — encontrolenirlivre.pages.dev"


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


def pedir(metodo, url, cred, corpo=None):
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
    try:
        with urllib.request.urlopen(req, timeout=60) as resposta:
            texto = resposta.read().decode("utf-8")
            return json.loads(texto) if texto else {}
    except urllib.error.HTTPError as erro:
        print("HTTP", erro.code, erro.read().decode("utf-8", "replace")[:800])
        raise


def abas(planilha):
    return {
        aba["properties"]["title"]: aba["properties"]
        for aba in planilha.get("sheets", [])
    }


def criar(cred):
    corpo = {
        "properties": {
            "title": TITULO,
            "locale": "pt_BR",
            "timeZone": "America/Sao_Paulo",
        },
        "sheets": [
            {
                "properties": {
                    "title": "presencas",
                    "gridProperties": {"frozenRowCount": 1},
                }
            },
            {"properties": {"title": "resumo"}},
        ],
    }
    return pedir(
        "POST",
        "https://sheets.googleapis.com/v4/spreadsheets",
        cred,
        corpo,
    )


def carregar_existente(cred, planilha_id):
    try:
        return pedir(
            "GET",
            f"https://sheets.googleapis.com/v4/spreadsheets/{planilha_id}",
            cred,
        )
    except urllib.error.HTTPError as erro:
        if erro.code == 404:
            return None
        raise


def escrever(cred, planilha_id):
    # Cabeçalho e nota.
    pedir(
        "PUT",
        f"https://sheets.googleapis.com/v4/spreadsheets/{planilha_id}/values/"
        "presencas!A1:H1?valueInputOption=RAW",
        cred,
        {"values": [CABECALHO]},
    )
    pedir(
        "PUT",
        f"https://sheets.googleapis.com/v4/spreadsheets/{planilha_id}/values/"
        "resumo!A1:E4?valueInputOption=USER_ENTERED",
        cred,
        {
            "values": [
                ["Total de presenças", "=COUNTA(presencas!A2:A)", "", "Atualizado em", "=NOW()"],
                [],
                ["Atividade", "Total", "", "Fonte", NOTA],
                [
                    "=QUERY(presencas!A2:H, \"select D, count(A) where D is not null "
                    "group by D label count(A) ''\", 0)",
                    "",
                ],
            ]
        },
    )


def formatar(cred, planilha_id, planilha):
    ids = {nome: info["sheetId"] for nome, info in abas(planilha).items()}
    if "presencas" not in ids:
        return
    sheet_id = ids["presencas"]
    pedidos = [
        {
            "updateSheetProperties": {
                "properties": {
                    "sheetId": sheet_id,
                    "gridProperties": {"frozenRowCount": 1},
                },
                "fields": "gridProperties.frozenRowCount",
            }
        },
        {
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": 0,
                    "endRowIndex": 1,
                },
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True},
                        "backgroundColor": {
                            "red": 0.937,
                            "green": 0.902,
                            "blue": 0.831,
                        },
                    }
                },
                "fields": "userEnteredFormat(textFormat,backgroundColor)",
            }
        },
        {
            "autoResizeDimensions": {
                "dimensions": {
                    "sheetId": sheet_id,
                    "dimension": "COLUMNS",
                    "startIndex": 0,
                    "endIndex": 8,
                }
            }
        },
    ]
    pedir(
        "POST",
        f"https://sheets.googleapis.com/v4/spreadsheets/{planilha_id}"
        ":batchUpdate",
        cred,
        {"requests": pedidos},
    )


def main():
    cred = credenciais()
    planilha = None
    planilha_id = ""

    if ID_ARQUIVO.exists():
        planilha_id = ID_ARQUIVO.read_text(encoding="utf-8").strip()
        if planilha_id:
            planilha = carregar_existente(cred, planilha_id)
            if planilha:
                print(f"planilha existente: {planilha_id}")

    if not planilha:
        planilha = criar(cred)
        planilha_id = planilha["spreadsheetId"]
        ID_ARQUIVO.parent.mkdir(parents=True, exist_ok=True)
        ID_ARQUIVO.write_text(planilha_id, encoding="utf-8")
        print(f"planilha criada: {planilha_id}")

    escrever(cred, planilha_id)
    formatar(cred, planilha_id, planilha)

    print(f"link: {planilha.get('spreadsheetUrl', '')}")
    print(f"id guardado em {ID_ARQUIVO}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
