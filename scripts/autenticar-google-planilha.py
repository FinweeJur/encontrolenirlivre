"""
Autoriza uma vez o acesso ao Google Sheets para o espelho das presenças.

O token antigo do MausBot não serve para duas coisas: não tem o escopo de
planilhas e o refresh token expirou (invalid_grant). Este fluxo pede só o
necessário:

  - spreadsheets: criar e atualizar a planilha do encontro;
  - drive.file: o app só enxerga os arquivos que ele mesmo criou.

O token fica fora do repositório, em
`%USERPROFILE%\\.config\\encontrao\\google-planilha.json`. Nada de segredo no
git. O cliente OAuth é o mesmo `client_secret.json` do MausBot (tipo Desktop).

Uso:
    python scripts/autenticar-google-planilha.py
"""
import os
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow

ESCOPOS = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]

BASE = Path(os.environ.get("USERPROFILE", "."))
CLIENTE = BASE / ".config" / "mausbot" / "google" / "client_secret.json"
TOKEN = BASE / ".config" / "encontrao" / "google-planilha.json"


def main():
    if not CLIENTE.exists():
        print(f"falta o client_secret.json em {CLIENTE}")
        print("crie um cliente OAuth do tipo Desktop no Google Cloud e salve com esse nome")
        return 2

    TOKEN.parent.mkdir(parents=True, exist_ok=True)
    fluxo = InstalledAppFlow.from_client_secrets_file(str(CLIENTE), ESCOPOS)
    print("abrindo o navegador para autorizar as planilhas…", flush=True)
    credenciais = fluxo.run_local_server(port=0, prompt="consent")
    TOKEN.write_text(credenciais.to_json(), encoding="utf-8")
    print(f"token gravado em {TOKEN}", flush=True)
    print("escopos:", ", ".join(ESCOPOS), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
