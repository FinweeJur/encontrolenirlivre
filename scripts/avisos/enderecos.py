"""Confere os endereços da programação no OpenStreetMap (Nominatim).

Por que existe: sala errada se corrige no dia; endereço errado manda gente
para o lugar errado. Este módulo consulta o Nominatim — serviço aberto, sem
chave de API — com User-Agent honesto e uma consulta por segundo, como pede a
política de uso.

O que ele não faz: não raspa o Google Maps, que proíbe coleta automatizada no
termo. Quando a organização manda um link `maps.app.goo.gl`, o link é apenas
resolvido (redirecionamento público) e o nome do lugar que vem nele entra como
conferência extra.

Cache em `.cache/osm-enderecos.json`: a mesma busca não sai duas vezes.
"""
import json
import os
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta

try:
    from . import textos
except ImportError:  # rodando como script solto: python scripts/avisos/enderecos.py
    import sys

    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from avisos import textos

UA = "finweejur/github artur colito"
CIDADE = "João Pessoa"
ARQUIVO_CACHE = os.path.join(textos.CACHE, "osm-enderecos.json")
VALIDADE = timedelta(days=30)
INTERVALO = 1.1
URL_BUSCA = "https://nominatim.openstreetmap.org/search"

# Endereços que a organização já passou por escrito ou por link do Maps.
# Entram como confirmação; o que o OSM achou continua ao lado, para auditoria.
CONFIRMADOS = {
    "SINTEP": {
        "nome": "R. Prof. José Coelho, 61, Centro, João Pessoa",
        "fonte": "link do Maps enviado pela organização",
    },
    "OAB": {
        "nome": "Av. João Cirilo da Silva, 444, Altiplano, João Pessoa",
        "fonte": "endereço informado pela organização",
    },
}


def _sem_acento(texto):
    decomposto = unicodedata.normalize("NFKD", str(texto or "").casefold())
    return "".join(c for c in decomposto if not unicodedata.combining(c))


# Palavras que aparecem em qualquer endereço de João Pessoa: não provam nada.
PALAVRAS_FRACAS = {
    "programa",
    "centro",
    "universidade",
    "federal",
    "paraiba",
    "pessoa",
    "joao",
    "cidade",
    "campo",
    "praia",
    "avenida",
    "rua",
    "bairro",
    "ufpb",
    "brasil",
    "nordeste",
    "regiao",
    "auditorio",
}


def _palavras(texto):
    """Palavras fortes do texto: quatro letras ou mais, sem as genéricas."""
    return {p for p in re.findall(r"[a-z]{4,}", _sem_acento(texto)) if p not in PALAVRAS_FRACAS}


def _agora():
    return datetime.now().replace(microsecond=0).isoformat()


def _carregar_cache():
    try:
        with open(ARQUIVO_CACHE, encoding="utf-8") as arquivo:
            return json.load(arquivo)
    except (OSError, ValueError):
        return {}


def _salvar_cache(dados):
    os.makedirs(textos.CACHE, exist_ok=True)
    with open(ARQUIVO_CACHE, "w", encoding="utf-8") as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)


def _valido(item):
    try:
        quando = datetime.fromisoformat(item.get("quando", ""))
    except ValueError:
        return False
    return datetime.now() - quando < VALIDADE


def buscar(consulta, cidade=CIDADE, usar_cache=True):
    """Consulta o Nominatim até achar algo na cidade certa.

    A tabela de lugares mistura nome do prédio, rua e organização. Quando a
    consulta inteira não dá nada, tenta versões mais simples (sem o nome da
    organização, só a rua com o número) antes de desistir.
    """
    chave = f"{consulta}|{cidade}"
    cache = _carregar_cache()

    if usar_cache and chave in cache and _valido(cache[chave]):
        return cache[chave]["resultado"]

    resultado = {"ok": False, "erro": "nenhum lugar encontrado"}
    for variacao in _variacoes(consulta, cidade):
        achado = _consultar(variacao)
        if not achado.get("ok"):
            resultado = achado
            continue
        resultado = achado
        if _na_cidade(achado, cidade):
            break

    cache[chave] = {"quando": _agora(), "resultado": resultado}
    _salvar_cache(cache)
    return resultado


def _variacoes(consulta, cidade):
    """Da consulta mais completa para a mais simples, sem repetir."""
    saida = [consulta]
    partes = [parte.strip() for parte in consulta.split(",") if parte.strip()]
    if len(partes) > 1:
        saida.append(", ".join(partes[1:]))

    rua = re.search(r"((?:Rua|R\.|Avenida|Av\.)\s+[^,]+?),?\s*(\d{1,5})", consulta)
    if rua:
        saida.append(f"{rua.group(1)}, {rua.group(2)}, {cidade}")
        saida.append(f"{rua.group(1)}, {cidade}")

    return list(dict.fromkeys(saida))


def _consultar(consulta):
    """Uma ida ao Nominatim, com três tentativas em caso de rede ruim."""
    parametros = urllib.parse.urlencode(
        {
            "q": consulta,
            "format": "jsonv2",
            "limit": 1,
            "addressdetails": 1,
            "accept-language": "pt-BR",
        }
    )
    pedido = urllib.request.Request(
        f"{URL_BUSCA}?{parametros}",
        headers={"user-agent": UA, "accept-language": "pt-BR"},
    )

    for tentativa in range(3):
        try:
            with urllib.request.urlopen(pedido, timeout=30) as resposta:
                lista = json.loads(resposta.read().decode("utf-8"))
            break
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError) as erro:
            if tentativa == 2:
                return {"ok": False, "erro": f"falha na consulta: {erro}"}
            time.sleep(2 * (tentativa + 1))
        finally:
            # Ritmo educado: uma consulta por segundo, mesmo quando falha.
            time.sleep(INTERVALO)

    if not lista:
        return {"ok": False, "erro": "nenhum lugar encontrado"}

    achado = lista[0]
    return {
        "ok": True,
        "nome": achado.get("display_name", ""),
        "lat": achado.get("lat"),
        "lon": achado.get("lon"),
        "tipo": achado.get("type", ""),
        "endereco": achado.get("address", {}),
    }


def _na_cidade(achado, cidade):
    """Confere a cidade no campo `address`, não no texto do endereço.

    Comparar com o texto inteiro dava falso positivo: uma rua chamada
    "Avenida João Pessoa", em Porto Alegre, passava como se fosse a cidade.
    """
    endereco = achado.get("endereco") or {}
    nomes = {
        endereco.get("city"),
        endereco.get("town"),
        endereco.get("municipality"),
        endereco.get("village"),
        endereco.get("hamlet"),
    }
    alvo = _sem_acento(cidade)
    return any(nome and _sem_acento(nome) == alvo for nome in nomes)


def avaliar(local, achado, cidade=CIDADE):
    """Classifica o achado em ok, duvida ou falhou, com motivo em português."""
    if not achado.get("ok"):
        return "falhou", achado.get("erro") or "sem resultado"

    nome = achado.get("nome", "")

    if not _na_cidade(achado, cidade):
        return "duvida", f"o resultado não fica em {cidade}: {nome}"

    # Nome genérico ("Mata Externa UFPB", "João Pessoa") não confirma prédio.
    # Só vale quando alguma palavra forte da busca aparece no resultado.
    minhas = _palavras(local.get("busca", ""))
    achadas = _palavras(nome)
    if minhas and not (minhas & achadas):
        return "duvida", f"o resultado não parece o lugar pedido: {nome}"

    numeros_busca = set(re.findall(r"\b\d{2,4}\b", local.get("busca", "")))
    numeros_nome = set(re.findall(r"\b\d{2,4}\b", nome))
    faltando = numeros_busca - numeros_nome
    if numeros_busca and faltando:
        return "duvida", f"número {', '.join(sorted(faltando))} não aparece: {nome}"

    return "ok", nome


def conferir_local(local):
    """Uma linha por lugar da tabela.

    O OSM não tem todo prédio da UFPB nem todo bar do Centro. Quando a
    organização já informou o endereço (link do Maps ou texto), esse dado entra
    como confirmação, e o que o OSM achou fica registrado ao lado.
    """
    achado = buscar(local["busca"])
    status, motivo = avaliar(local, achado)

    confirmado = CONFIRMADOS.get(local["chave"])
    if confirmado:
        osm = achado.get("nome") or "sem registro no OSM"
        return {
            "chave": local["chave"],
            "busca": local["busca"],
            "status": "ok",
            "motivo": f"{confirmado['fonte']}: {confirmado['nome']} · OSM: {osm}",
            "lat": achado.get("lat"),
            "lon": achado.get("lon"),
        }

    return {
        "chave": local["chave"],
        "busca": local["busca"],
        "status": status,
        "motivo": motivo,
        "lat": achado.get("lat"),
        "lon": achado.get("lon"),
    }


def locais_do_programa():
    """Tabela de lugares exportada pelo `dump-sessoes.mjs`."""
    caminho = os.path.join(textos.CACHE, "locais.json")
    if not os.path.exists(caminho):
        textos.garantir_sessoes()
    try:
        with open(caminho, encoding="utf-8") as arquivo:
            return json.load(arquivo)
    except (OSError, ValueError):
        return []


def conferir_programa():
    """Todos os lugares da programação, um por um."""
    return [conferir_local(local) for local in locais_do_programa()]


def mencionados(texto):
    """Lugares da tabela citados num texto, do mais específico ao mais geral."""
    alvo = _sem_acento(texto)
    achados = []
    for local in locais_do_programa():
        chave = _sem_acento(local["chave"]).strip()
        if not chave:
            continue
        if re.search(rf"\b{re.escape(chave)}\b", alvo):
            achados.append(local)
    return achados


def conferir_texto(texto, consultar=False):
    """Confere os lugares citados num aviso.

    Com `consultar=False` não vai à rede: usa o cache e os endereços que a
    organização já confirmou. Endereço sem cache sai como "sem_cache" e não
    bloqueia nada — aviso urgente não pode parar por causa do Nominatim.
    """
    resultados = []
    for local in mencionados(texto):
        if consultar or local["chave"] in CONFIRMADOS:
            resultados.append(conferir_local(local))
            continue

        consulta = f"{local['busca']}|{CIDADE}"
        if consulta not in _carregar_cache():
            resultados.append(
                {"chave": local["chave"], "status": "sem_cache", "motivo": "consulte o endereço"}
            )
            continue

        resultados.append(conferir_local(local))
    return resultados


def resolver_link_maps(url):
    """Resolve um link curto do Maps e devolve o nome do lugar do caminho.

    É só o redirecionamento público: nada de abrir a página nem ler conteúdo.
    """

    class SemRedirecionar(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None

    pedido = urllib.request.Request(url, headers={"user-agent": UA})
    abridor = urllib.request.build_opener(SemRedirecionar)
    try:
        abridor.open(pedido, timeout=20)
        return {"ok": False, "erro": "o link não redirecionou"}
    except urllib.error.HTTPError as erro:
        destino = erro.headers.get("location") or ""
    except (urllib.error.URLError, TimeoutError) as falha:
        return {"ok": False, "erro": f"falha ao resolver: {falha}"}

    achado = re.search(r"/maps/place/([^/]+)", destino)
    nome = urllib.parse.unquote_plus(achado.group(1)) if achado else ""
    nome = nome.replace("+", " ").strip()
    return {"ok": bool(nome), "nome": nome, "destino": destino}


def formatar(resultados):
    """Texto curto para o log."""
    if not resultados:
        return "nenhum endereço citado"
    linhas = []
    for item in resultados:
        marca = {"ok": "ok", "duvida": "CONFERIR", "falhou": "FALHOU", "sem_cache": "sem cache"}[
            item["status"]
        ]
        linhas.append(f"- {item['chave']}: {marca} — {item.get('motivo', '')}")
    return "\n".join(linhas)


if __name__ == "__main__":
    for linha in conferir_programa():
        print(f"{linha['status']:8} {linha['chave']:22} {linha['motivo'][:90]}")
