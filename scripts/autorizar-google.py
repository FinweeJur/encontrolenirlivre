"""Renova a autorização do Google usada pelo formulário de ressarcimento.

Por que existe: o formulário grava os comprovantes no Drive e a linha na
planilha com um `refresh_token`. Quando esse token vence ou é revogado, todo
envio cai em "Não foi possível enviar agora" — e ninguém descobre o motivo.

O que faz: abre o consentimento do Google, escuta o retorno em
`http://127.0.0.1:8765`, troca o código por um token novo e regrava
`~/.config/encontrao/google-planilha.json`. Não imprime segredo nenhum.

Depois de rodar, o `refresh_token` novo precisa ir para o Cloudflare:

    npx wrangler pages secret put GOOGLE_REFRESH_TOKEN --project-name encontrolenirlivre

Uso:
    python scripts/autorizar-google.py            # abre o navegador
    python scripts/autorizar-google.py --manual   # cola o código no terminal
"""
import argparse
import http.server
import io
import json
import os
import socketserver
import sys
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timedelta, timezone

CONFIG = os.path.join(os.path.expanduser("~"), ".config", "encontrao")
ARQUIVO = os.path.join(CONFIG, "google-planilha.json")
PORTA = 8765
REDIRECIONAR = f"http://127.0.0.1:{PORTA}/"
ESCOPOS = (
    "https://www.googleapis.com/auth/drive.file "
    "https://www.googleapis.com/auth/spreadsheets"
)
URL_AUTORIZAR = "https://accounts.google.com/o/oauth2/v2/auth"
URL_TOKEN = "https://oauth2.googleapis.com/token"


def carregar():
    with io.open(ARQUIVO, encoding="utf-8") as arquivo:
        return json.load(arquivo)


def url_de_consentimento(cliente, redirecionar):
    parametros = urllib.parse.urlencode(
        {
            "client_id": cliente["client_id"],
            "redirect_uri": redirecionar,
            "response_type": "code",
            "scope": ESCOPOS,
            "access_type": "offline",
            # Sem `prompt=consent` o Google pode devolver token sem refresh.
            "prompt": "consent",
            "include_granted_scopes": "true",
        }
    )
    return f"{URL_AUTORIZAR}?{parametros}"


def trocar_codigo(cliente, codigo, redirecionar):
    corpo = urllib.parse.urlencode(
        {
            "client_id": cliente["client_id"],
            "client_secret": cliente["client_secret"],
            "code": codigo,
            "grant_type": "authorization_code",
            "redirect_uri": redirecionar,
        }
    ).encode("utf-8")
    pedido = urllib.request.Request(
        URL_TOKEN,
        data=corpo,
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(pedido, timeout=60) as resposta:
        return json.loads(resposta.read().decode("utf-8"))


def gravar(cliente, devolvido):
    validade = datetime.now(timezone.utc) + timedelta(seconds=int(devolvido.get("expires_in", 3600)))
    dados = {
        "client_id": cliente["client_id"],
        "client_secret": cliente["client_secret"],
        "refresh_token": devolvido.get("refresh_token") or cliente.get("refresh_token"),
        "token": devolvido.get("access_token"),
        "token_uri": URL_TOKEN,
        "scopes": (devolvido.get("scope") or ESCOPOS).split(),
        "expiry": validade.isoformat(timespec="seconds") + "Z",
    }
    if not dados["refresh_token"]:
        raise SystemExit("O Google não devolveu refresh_token. Rode de novo com --manual.")
    os.makedirs(CONFIG, exist_ok=True)
    with io.open(ARQUIVO, "w", encoding="utf-8") as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)
    return dados


class Retorno(http.server.BaseHTTPRequestHandler):
    codigo = None
    erro = None

    def do_GET(self):  # noqa: N802
        partes = urllib.parse.urlparse(self.path)
        consulta = urllib.parse.parse_qs(partes.query)
        Retorno.codigo = (consulta.get("code") or [None])[0]
        Retorno.erro = (consulta.get("error") or [None])[0]

        self.send_response(200)
        self.send_header("content-type", "text/html; charset=utf-8")
        self.end_headers()
        if Retorno.codigo:
            self.wfile.write("<h2>Autorização concluída. Pode fechar esta aba.</h2>".encode())
        else:
            self.wfile.write(
                f"<h2>Não autorizou: {Retorno.erro}</h2>".encode("utf-8")
            )

    def log_message(self, *args):
        pass


def pelo_navegador(cliente):
    endereco = url_de_consentimento(cliente, REDIRECIONAR)
    print("Abrindo o consentimento do Google…")
    print("Se a aba não abrir, copie este endereço:\n")
    print(endereco)
    print()

    with socketserver.TCPServer(("127.0.0.1", PORTA), Retorno) as servidor:
        servidor.timeout = 300
        try:
            webbrowser.open(endereco)
        except Exception:  # noqa: BLE001
            pass
        while Retorno.codigo is None and Retorno.erro is None:
            servidor.handle_request()

    if Retorno.erro:
        raise SystemExit(f"Google recusou: {Retorno.erro}")
    return trocar_codigo(cliente, Retorno.codigo, REDIRECIONAR)


def manual(cliente):
    print("Autorize neste endereço:\n")
    print(url_de_consentimento(cliente, "urn:ietf:wg:oauth:2.0:oob"))
    print("\nCole aqui o código que o Google mostrar:")
    codigo = input().strip()
    return trocar_codigo(cliente, codigo, "urn:ietf:wg:oauth:2.0:oob")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manual", action="store_true", help="colar o código no terminal")
    args = parser.parse_args()

    if not os.path.exists(ARQUIVO):
        raise SystemExit(f"Não achei {ARQUIVO}. Rode o script de criação da pasta primeiro.")

    cliente = carregar()
    devolvido = manual(cliente) if args.manual else pelo_navegador(cliente)
    dados = gravar(cliente, devolvido)

    print("Autorização renovada.")
    print("Escopos:", ", ".join(dados["scopes"]))
    print("Agora atualize o segredo no Cloudflare (o valor está no arquivo, não no histórico).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
