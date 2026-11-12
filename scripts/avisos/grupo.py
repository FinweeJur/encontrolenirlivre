"""Lê o extrato dos grupos do encontro e aponta o que pode mudar a programação.

Por que existe: a mudança de última hora quase sempre aparece primeiro no
grupo, não no documento. O conferidor varre as mensagens guardadas pelo
serviço do WhatsApp (`/grupo`) e separa dois tipos de achado:

- leve: a mensagem fala em mudança ("mudou", "correção", "agora é"), mas não
  contradiz nada que esteja na programação do dia — é leitura humana;
- forte: a mensagem cita hora, sala ou lugar que não existem na programação
  do dia. Este bloqueia o aviso uma vez, para alguém olhar.

O bloqueio é único: a mensagem entra em `.cache/grupo-vistos.json` e não trava
o envio de novo. Sem isso, uma mensagem antiga pararia a rotina para sempre.

Regra de privacidade: só se lê o que está nos grupos configurados, e nada sai
da máquina.
"""
import json
import os
import re
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

try:
    from . import comum, enderecos, textos
except ImportError:  # rodando como script solto
    import sys

    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from avisos import comum, enderecos, textos

BASE = os.environ.get("WHATSAPP_URL", "http://127.0.0.1:8898/enviar").rsplit("/", 1)[0]
ARQUIVO_VISTOS = os.path.join(textos.CACHE, "grupo-vistos.json")

PALAVRAS_MUDANCA = (
    "mudou",
    "mudanca",
    "mudar",
    "correcao",
    "corrigid",
    "corrigir",
    "retific",
    "errado",
    "engano",
    "nao e mais",
    "nao sera",
    "agora e",
    "agora sera",
    "passou a ser",
    "passa a ser",
    "vai ser",
    "sera as",
    "sera em",
    "sera no",
    "sera na",
    "novo horario",
    "novo local",
    "nova sala",
    "outro local",
    "outra sala",
    "alterado",
    "alteracao",
    "confirmado",
    "confirmada",
)

REDES = ("renap", "renaju", "ipdms")


def _sem_acento(texto):
    decomposto = unicodedata.normalize("NFKD", str(texto or "").casefold())
    return "".join(c for c in decomposto if not unicodedata.combining(c))


def grupos():
    """Grupos configurados no avisador: nome e jid."""
    return [g for g in comum.grupos_configurados() if g.get("jid")]


def ler(jid, limite=80, horas=48):
    """Mensagens guardadas de um grupo. Lista vazia quando não há extrato."""
    parametros = urllib.parse.urlencode({"jid": jid, "limite": limite, "horas": horas})
    pedido = urllib.request.Request(
        f"{BASE}/grupo?{parametros}", headers={"user-agent": "finweejur/github artur colito"}
    )
    try:
        with urllib.request.urlopen(pedido, timeout=15) as resposta:
            dados = json.loads(resposta.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, ValueError):
        return []
    return dados.get("mensagens") or []


def mensagens(horas=24, limite=120):
    """Todas as mensagens dos grupos configurados, com o nome do grupo."""
    lista = []
    for grupo in grupos():
        for mensagem in ler(grupo["jid"], limite=limite, horas=horas):
            lista.append({**mensagem, "grupo": grupo.get("nome") or grupo["jid"]})
    lista.sort(key=lambda m: m.get("quando") or "")
    return lista


def _horas_do_dia(dia):
    fatos = textos.fatos_do_dia(dia) or {}
    return {h for h in (fatos.get("horas") or set())}


def _salas_do_dia(dia):
    fatos = textos.fatos_do_dia(dia) or {}
    locais = " | ".join(fatos.get("locais") or [])
    return {_sem_acento(s) for s in re.findall(r"Sala[s]?\s+([A-Za-zÀ-ÿ0-9]+)", locais)}


def _lugares_do_dia(dia):
    fatos = textos.fatos_do_dia(dia) or {}
    locais = _sem_acento(" | ".join(fatos.get("locais") or []))
    return locais


def alertas(dia, horas=24):
    """Achados do grupo que interessam à programação de um dia."""
    horas_dia = {h.replace("h00", "h") for h in _horas_do_dia(dia)}
    salas_dia = _salas_do_dia(dia)
    locais_dia = _lugares_do_dia(dia)

    achados = []
    for mensagem in mensagens(horas=horas):
        texto = mensagem.get("texto") or ""
        if not texto.strip():
            continue

        simples = _sem_acento(texto)
        motivo_mudanca = any(p in simples for p in PALAVRAS_MUDANCA)

        # Sem palavra de mudança é conversa comum: pergunta de horário de
        # chegada, combinado de carona. Isso não bloqueia aviso nenhum.
        if not motivo_mudanca:
            continue

        fortes = []
        for achado in re.finditer(r"\b(\d{1,2}h\d{0,2})\b", texto):
            hora = achado.group(1).replace("h00", "h")
            if horas_dia and hora not in horas_dia:
                fortes.append(f"hora {achado.group(1)} não está na programação do dia")

        for achado in re.finditer(r"\bSala\s+([A-Za-zÀ-ÿ0-9]+)", texto):
            if salas_dia and _sem_acento(achado.group(1)) not in salas_dia:
                fortes.append(f"sala {achado.group(1)} não está na programação do dia")

        for local in enderecos.mencionados(texto):
            chave = _sem_acento(local["chave"])
            if locais_dia and chave not in locais_dia:
                fortes.append(f"lugar “{local['chave']}” não está na programação do dia")

        achados.append(
            {
                "id": mensagem.get("id") or f"{mensagem.get('quando')}-{texto[:20]}",
                "grupo": mensagem.get("grupo"),
                "autor": mensagem.get("autor") or "alguém",
                "quando": mensagem.get("quando"),
                "trecho": " ".join(texto.split())[:200],
                "nivel": "forte" if fortes else "leve",
                "motivos": fortes,
            }
        )

    achados.sort(key=lambda item: item["quando"] or "", reverse=True)
    return achados


def _vistos():
    try:
        with open(ARQUIVO_VISTOS, encoding="utf-8") as arquivo:
            return set(json.load(arquivo))
    except (OSError, ValueError):
        return set()


def _marcar(ids):
    vistos = _vistos() | set(ids)
    os.makedirs(textos.CACHE, exist_ok=True)
    with open(ARQUIVO_VISTOS, "w", encoding="utf-8") as arquivo:
        json.dump(sorted(vistos)[-500:], arquivo, ensure_ascii=False, indent=2)


def bloqueios(dia, horas=24):
    """Achados fortes ainda não vistos. Marca como visto antes de devolver."""
    vistos = _vistos()
    novos = [a for a in alertas(dia, horas) if a["nivel"] == "forte" and a["id"] not in vistos]
    if novos:
        _marcar(a["id"] for a in novos)
    return novos


def formatar(lista):
    if not lista:
        return "grupo sem novidade"
    linhas = []
    for item in lista:
        marcas = "; ".join(item["motivos"]) if item["motivos"] else "fala em mudança"
        linhas.append(
            f"- [{item['nivel']}] {item['quando']} · {item['grupo']} · {item['autor']}: "
            f"{item['trecho']} ({marcas})"
        )
    return "\n".join(linhas)


if __name__ == "__main__":
    import sys

    dia = sys.argv[1] if len(sys.argv) > 1 else "12"
    print(f"grupos: {', '.join(g['nome'] for g in grupos()) or 'nenhum'}")
    print(formatar(alertas(dia, horas=48)))
