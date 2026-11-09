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

O endereço de autorização é gravado em `.cache/google-auth-url.txt` e impresso
no terminal. O servidor local espera o retorno em `http://localhost:8765/`.
Abra o endereço no navegador, escolha a conta e clique em Permitir.

Uso:
    python scripts/autenticar-google-planilha.py
"""
import http.server
import os
import socketserver
import threading
import urllib.parse
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow

ESCOPOS = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]

BASE = Path(os.environ.get("USERPROFILE", "."))
CLIENTE = BASE / ".config" / "mausbot" / "google" / "client_secret.json"
TOKEN = BASE / ".config" / "encontrao" / "google-planilha.json"
URL_ARQUIVO = Path(__file__).resolve().parents[1] / ".cache" / "google-auth-url.txt"
PORTA = 8765


def main():
    if not CLIENTE.exists():
        print(f"falta o client_secret.json em {CLIENTE}")
        print("crie um cliente OAuth do tipo Desktop no Google Cloud e salve com esse nome")
        return 2

    fluxo = InstalledAppFlow.from_client_secrets_file(str(CLIENTE), ESCOPOS)
    fluxo.redirect_uri = f"http://localhost:{PORTA}/"
    endereco, _ = fluxo.authorization_url(access_type="offline", prompt="consent")

    URL_ARQUIVO.parent.mkdir(parents=True, exist_ok=True)
    URL_ARQUIVO.write_text(endereco, encoding="utf-8")
    print(f"URL: {endereco}", flush=True)
    print(f"esperando o retorno em http://localhost:{PORTA}/ …", flush=True)

    codigo = {}

    class Retorno(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            if "code" in params:
                codigo["code"] = params["code"][0]
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(
                    "<h1>Autorizado.</h1><p>Pode fechar esta aba e voltar ao "
                    "OpenCode.</p>".encode("utf-8")
                )
            else:
                self.send_response(400)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(
                    "<h1>Não deu.</h1><p>Volte ao OpenCode e tente de novo.</p>".encode(
                        "utf-8"
                    )
                )

        def log_message(self, *args):
            pass

    with socketserver.TCPServer(("127.0.0.1", PORTA), Retorno) as servidor:
        thread = threading.Thread(target=servidor.handle_request, daemon=True)
        thread.start()
        thread.join(timeout=1800)

    if not codigo.get("code"):
        print("sem código: a autorização não foi concluída", flush=True)
        return 1

    fluxo.fetch_token(code=codigo["code"])
    TOKEN.parent.mkdir(parents=True, exist_ok=True)
    TOKEN.write_text(fluxo.credentials.to_json(), encoding="utf-8")
    print(f"token gravado em {TOKEN}", flush=True)
    print("escopos:", ", ".join(ESCOPOS), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
