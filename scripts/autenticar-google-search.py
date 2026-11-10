"""
Autoriza o Search Console e a verificação de site na conta do dono.

Escopos:
  - webmasters: adicionar o site e enviar o sitemap;
  - siteverification: provar que o site é do dono pelo meta tag.

O token fica fora do repositório, em
`%USERPROFILE%\\.config\\encontrao\\google-search.json`.

Uso:
    python scripts/autenticar-google-search.py
"""
import http.server
import os
import socketserver
import threading
import urllib.parse
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow

ESCOPOS = [
    "https://www.googleapis.com/auth/webmasters",
    "https://www.googleapis.com/auth/siteverification",
]

BASE = Path(os.environ.get("USERPROFILE", "."))
CLIENTE = BASE / ".config" / "mausbot" / "google" / "client_secret.json"
TOKEN = BASE / ".config" / "encontrao" / "google-search.json"
URL_ARQUIVO = Path(__file__).resolve().parents[1] / ".cache" / "google-search-url.txt"
PORTA = 8765


def main():
    if not CLIENTE.exists():
        print(f"falta o client_secret.json em {CLIENTE}")
        return 2

    fluxo = InstalledAppFlow.from_client_secrets_file(str(CLIENTE), ESCOPOS)
    fluxo.redirect_uri = f"http://localhost:{PORTA}/"
    endereco, _ = fluxo.authorization_url(access_type="offline", prompt="consent")

    URL_ARQUIVO.parent.mkdir(parents=True, exist_ok=True)
    URL_ARQUIVO.write_text(endereco, encoding="utf-8")
    print(f"URL: {endereco}", flush=True)
    print(f"esperando o retorno em http://localhost:{PORTA}/", flush=True)

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
                self.end_headers()
                self.wfile.write(b"<h1>Nao deu.</h1>")

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
