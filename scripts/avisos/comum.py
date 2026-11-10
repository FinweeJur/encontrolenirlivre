"""
Peças comuns dos avisos do encontro.

Aqui ficam só as coisas que os dois avisadores usam: caminhos, relógio de
Brasília, leitura do segredo local e entrega por Telegram e WhatsApp.

O WhatsApp não fala com a internet: fala com o serviço local do OpenMausBot
em 127.0.0.1:8899, porque a sessão do aparelho só existe nesta máquina. Se o
serviço estiver parado, a função devolve erro e quem chamou guarda na fila.

Nenhuma função imprime token, chat id ou chave.
"""
import io
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

UA = "finweejur/github artur colito"
FUSO = timezone(timedelta(hours=-3))

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = os.path.join(RAIZ, ".cache")

SITE = "https://encontrolenirlivre.pages.dev"
PROGRAMA = SITE + "/programa"
PLACAR = SITE + "/placar"
PAINEL = SITE + "/painel"

ENV_TELEGRAM = os.environ.get("ENCONTRAO_ENV", "").strip() or r"X:\DevCoder\controle-popular\scripts\.env"
# O mesmo código roda no desktop e no home-pc, com caminhos diferentes.
if not os.path.exists(ENV_TELEGRAM):
    ENV_TELEGRAM = r"C:\DevCoder\controle-popular\scripts\.env"

# Configuração local (grupos do WhatsApp e senha do painel). Fora do repo e
# fora do perfil do usuário quando ENCONTRAO_BASE aponta para uma pasta fixa.
CONFIG = os.environ.get("ENCONTRAO_BASE", "").strip() or os.path.join(
    os.path.expanduser("~"), ".config", "encontrao"
)
TOKEN_ARQUIVO = os.path.join(CONFIG, "presenca-token.txt")

WHATSAPP_PADRAO = "http://127.0.0.1:8899/enviar"
GRUPO_PADRAO = "OpenSecretario"

# Grupos que recebem os avisos do encontro. O arquivo fica fora do repositório
# porque o JID identifica a conversa: não é segredo, mas não precisa ser versionado.
GRUPOS_ARQUIVO = os.path.join(CONFIG, "whatsapp-grupos.json")


def agora_br():
    """Agora no horário de Brasília, sem depender de tzdata do Windows."""
    return datetime.now(FUSO)


def ler_env(caminho=ENV_TELEGRAM):
    """Lê um .env simples. Devolve dicionário vazio se o arquivo não existir."""
    dados = {}
    if not os.path.exists(caminho):
        return dados
    for linha in io.open(caminho, encoding="utf-8", errors="replace").read().splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("#") or "=" not in linha:
            continue
        nome, _, valor = linha.partition("=")
        dados[nome.strip()] = valor.strip().strip('"').strip("'")
    return dados


def ler_token():
    """Senha do painel: ambiente ou arquivo fora do repositório."""
    do_ambiente = os.environ.get("PRESENCA_TOKEN", "").strip()
    if do_ambiente:
        return do_ambiente
    if os.path.exists(TOKEN_ARQUIVO):
        return io.open(TOKEN_ARQUIVO, encoding="utf-8").read().strip()
    return ""


def ler_json(caminho, padrao):
    if not os.path.exists(caminho):
        return padrao
    try:
        with io.open(caminho, encoding="utf-8") as arquivo:
            return json.load(arquivo)
    except (OSError, ValueError):
        return padrao


def salvar_json(caminho, dados):
    """Grava de forma atômica: o estado nunca fica pela metade."""
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    temporario = caminho + ".tmp"
    with io.open(temporario, "w", encoding="utf-8") as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)
    os.replace(temporario, caminho)


def telegram(texto, env=None):
    """Manda texto puro para o chat configurado. Devolve (ok, motivo)."""
    env = env if env is not None else ler_env()
    token = env.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat = env.get("TELEGRAM_CHAT_ID", "").strip()
    if not token or not chat:
        return False, "sem TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID"

    corpo = urllib.parse.urlencode(
        {
            "chat_id": chat,
            "text": texto[:3900],
            "disable_web_page_preview": "true",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=corpo,
        headers={"user-agent": UA},
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resposta:
            return resposta.status == 200, f"telegram {resposta.status}"
    except urllib.error.HTTPError as erro:
        # O corpo do erro do Telegram não repete o token; a descrição ajuda.
        try:
            detalhe = erro.read().decode("utf-8", "replace")[:200]
        except Exception:  # noqa: BLE001
            detalhe = ""
        return False, f"telegram {erro.code}: {detalhe}"
    except Exception as erro:  # noqa: BLE001
        return False, f"telegram erro: {erro}"


def whatsapp(texto, grupo=None, jid=None):
    """Manda pelo serviço local. Devolve (ok, motivo, jid_usado)."""
    url = os.environ.get("WHATSAPP_URL", WHATSAPP_PADRAO).strip()
    destino_jid = (jid or os.environ.get("WHATSAPP_JID", "")).strip()
    destino_grupo = (grupo or os.environ.get("WHATSAPP_GRUPO", GRUPO_PADRAO)).strip()

    corpo = {"texto": texto[:3900]}
    if destino_jid:
        corpo["jid"] = destino_jid
    else:
        corpo["grupo"] = destino_grupo

    req = urllib.request.Request(
        url,
        data=json.dumps(corpo).encode("utf-8"),
        method="POST",
        headers={"content-type": "application/json", "user-agent": UA},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resposta:
            dado = json.loads(resposta.read().decode("utf-8") or "{}")
            return resposta.status == 200, f"whatsapp {resposta.status}", dado.get("jid", "")
    except urllib.error.HTTPError as erro:
        try:
            detalhe = erro.read().decode("utf-8", "replace")[:200]
        except Exception:  # noqa: BLE001
            detalhe = ""
        return False, f"whatsapp {erro.code}: {detalhe}", ""
    except Exception as erro:  # noqa: BLE001
        return False, f"whatsapp fora: {erro}", ""


def grupos_configurados():
    """Lista de {nome, jid} que recebem os avisos.

    Aceita lista simples ou objeto com a chave ``grupos``. Item pode ser só o
    nome do grupo ou ``{"nome": ..., "jid": ...}``. Arquivo ausente devolve
    lista vazia; quem chamou decide o padrão.
    """
    dados = ler_json(GRUPOS_ARQUIVO, [])
    if isinstance(dados, dict):
        dados = dados.get("grupos", [])
    if not isinstance(dados, list):
        return []
    saida = []
    for item in dados:
        if isinstance(item, str) and item.strip():
            saida.append({"nome": item.strip(), "jid": ""})
        elif isinstance(item, dict):
            jid = str(item.get("jid") or "").strip()
            nome = str(item.get("nome") or jid).strip()
            if jid or nome:
                saida.append({"nome": nome, "jid": jid})
    return saida


def whatsapp_grupos(texto, alvos=None, intervalo=1.5):
    """Manda o mesmo texto para todos os grupos configurados.

    Devolve ``(ok, motivos, falhas)``: ``ok`` só é verdadeiro quando todos
    receberam; ``falhas`` é a lista de alvos que ficaram de fora, para a fila.
    O intervalo evita rajada no mesmo número.
    """
    if alvos is None:
        alvos = grupos_configurados()
    if not alvos:
        ok, motivo, jid = whatsapp(texto)
        return ok, motivo, ([] if ok else [{"nome": jid or GRUPO_PADRAO, "jid": jid}])

    motivos = []
    falhas = []
    for posicao, alvo in enumerate(alvos):
        if posicao:
            time.sleep(intervalo)
        jid = alvo.get("jid") or ""
        ok, motivo, _ = whatsapp(
            texto,
            jid=jid or None,
            grupo=None if jid else alvo.get("nome") or GRUPO_PADRAO,
        )
        motivos.append(f"{alvo.get('nome') or jid}: {motivo}")
        if not ok:
            falhas.append({"nome": alvo.get("nome") or jid, "jid": jid})

    return not falhas, " | ".join(motivos), falhas


def entregar(texto, env=None, com_whatsapp=True):
    """Dispara nos dois canais. Devolve o resultado de cada um."""
    ok_t, motivo_t = telegram(texto, env)
    if com_whatsapp:
        ok_w, motivo_w, falhas = whatsapp_grupos(texto)
        jid = ", ".join(a["jid"] for a in grupos_configurados() if a.get("jid"))
    else:
        ok_w, motivo_w, jid, falhas = False, "whatsapp desligado neste teste", "", []
    return {
        "telegram": (ok_t, motivo_t),
        "whatsapp": (ok_w, motivo_w, jid),
        "whatsapp_falhas": falhas,
    }
