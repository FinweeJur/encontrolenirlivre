"""
Revisor determinístico dos avisos.

Não é modelo de linguagem: é uma lista de regras que pega os erros que mais
aparecem em mensagem automática — concordância de número, "as" no lugar de
"às", palavra repetida, espaço duplo, hora mal formatada, texto sem acento e
número de sala/GD que não existe na programação do dia.

A ideia é simples: o avisador só dispara se `revisar()` devolver lista vazia.
Quando algo escapa, a mensagem fica no log em vez de ir para o grupo.
"""
import re
import unicodedata

PLURAIS = (
    "pessoas|presenças|atividades|inscrições|vagas|salas|oficinas|plenárias|"
    "mesas|rodas|dias|participantes|GDs"
)
SINGULARES = (
    "pessoa|presença|atividade|inscrição|vaga|sala|oficina|plenária|mesa|"
    "roda|dia|participante|GD"
)

VERBOS_PLURAL = "fizeram|foram|estão|têm|chegaram|marcaram|compareceram"
VERBOS_SINGULAR = "fez|foi|está|tem|chegou|marcou|compareceu"

SEM_ACENTO = (
    "ate|voce|salao|programacao|inscricao|nao|tambem|horario|organizacao|"
    "reuniao|informacao|endereco|presenca"
)


def _sem_acento(texto):
    """Minúsculas e sem acento, para comparar sala e prédio."""
    decomposto = unicodedata.normalize("NFKD", texto.casefold())
    return "".join(c for c in decomposto if not unicodedata.combining(c))


def _hora_curta(valor):
    """8h30 e 08h30 viram a mesma chave."""
    achado = re.match(r"^(\d{1,2})h(\d{2})?$", valor.strip())
    if not achado:
        return None
    hora = int(achado.group(1))
    minuto = achado.group(2) or "00"
    return f"{hora}h{minuto}" if minuto != "00" else f"{hora}h"


def _problema(regra, linha, trecho, correcao):
    return {"regra": regra, "linha": linha, "trecho": trecho, "correcao": correcao}


def revisar(texto, fatos=None):
    """Devolve a lista de problemas. Lista vazia quer dizer texto aprovado."""
    problemas = []
    linhas = texto.replace("\r\n", "\n").split("\n")

    for numero, linha in enumerate(linhas, start=1):
        limpa = linha.strip()

        if linha != linha.rstrip():
            problemas.append(_problema("espaço", numero, "fim da linha", "remover o espaço"))

        if re.search(r"\S  +\S", limpa):
            problemas.append(_problema("espaço", numero, "espaço duplo", "deixar um só"))
        if re.search(r"\s+[,.;:!?]", limpa):
            problemas.append(_problema("pontuação", numero, "espaço antes de pontuação", "colar a pontuação"))
        if re.search(r"[!?][A-Za-zÀ-ÿ]", limpa):
            problemas.append(_problema("pontuação", numero, "sem espaço depois de ! ou ?", "acrescentar espaço"))
        if re.search(r"([!?])\1", limpa):
            problemas.append(_problema("pontuação", numero, "pontuação repetida", "usar uma só"))

        # Concordância de número.
        for achado in re.finditer(rf"\b1\s+({PLURAIS})\b", limpa, re.IGNORECASE):
            problemas.append(
                _problema("concordância", numero, achado.group(0), "usar o singular")
            )
        for achado in re.finditer(rf"\b([2-9]|\d{{2,}})\s+({SINGULARES})\b", limpa, re.IGNORECASE):
            problemas.append(
                _problema("concordância", numero, achado.group(0), "usar o plural")
            )

        # Concordância do verbo com o sujeito.
        padrao = rf"\b1\s+({SINGULARES})\b[^.!?\n]{{0,30}}\b({VERBOS_PLURAL})\b"
        for achado in re.finditer(padrao, limpa, re.IGNORECASE):
            problemas.append(
                _problema("concordância", numero, achado.group(0), "verbo no singular")
            )
        padrao = rf"\b1\s+({PLURAIS})\b[^.!?\n]{{0,30}}\b({VERBOS_PLURAL})\b"
        for achado in re.finditer(padrao, limpa, re.IGNORECASE):
            problemas.append(
                _problema("concordância", numero, achado.group(0), "número e verbo no singular")
            )
        padrao = rf"\b([2-9]|\d{{2,}})\s+({PLURAIS})\b[^.!?\n]{{0,30}}\b({VERBOS_SINGULAR})\b"
        for achado in re.finditer(padrao, limpa, re.IGNORECASE):
            problemas.append(
                _problema("concordância", numero, achado.group(0), "verbo no plural")
            )

        # Gênero de "sala" e "salas".
        if re.search(r"\b(no|do|ao|pelo|um)\s+Sala\b", limpa, re.IGNORECASE):
            problemas.append(_problema("concordância", numero, "no/do/ao Sala", "usar na/da/à Sala"))
        if re.search(r"\b(no|do|ao|pelo|um)\s+Salas\b", limpa, re.IGNORECASE):
            problemas.append(_problema("concordância", numero, "no/do/ao Salas", "usar nas/das/às Salas"))
        if re.search(r"\bo\s+Sala\b", limpa, re.IGNORECASE):
            problemas.append(_problema("concordância", numero, "o Sala", "usar a Sala"))

        # Crase e horas.
        if re.search(r"\bas\s+\d{1,2}h", limpa):
            problemas.append(_problema("crase", numero, "as + hora", "trocar por “às”"))
        if re.search(r"\bha\s+\d", limpa, re.IGNORECASE):
            problemas.append(_problema("acento", numero, "ha + tempo", "trocar por “há”"))
        if re.search(r"\bà\s+partir\b", limpa, re.IGNORECASE):
            problemas.append(_problema("crase", numero, "à partir", "trocar por “a partir”"))
        if re.search(r"\bà\s+(o|os|um|uns)\b", limpa, re.IGNORECASE):
            problemas.append(_problema("crase", numero, "à + masculino", "trocar por “ao”"))
        if re.search(r"\d{1,2}h\d{2}hs\b|\d{1,2}hs\b", limpa):
            problemas.append(_problema("hora", numero, "hora com hs", "usar 13h30"))
        if re.search(r"(?<![\d:])\d{1,2}:\d{2}(?![\d:])", limpa):
            problemas.append(_problema("hora", numero, "hora com dois-pontos", "usar 13h30"))
        if re.search(r"\bhouveram\b", limpa, re.IGNORECASE):
            problemas.append(_problema("concordância", numero, "houveram", "trocar por “houve”"))

        # Grafia e repetição.
        if re.search(r"\bcheckin\b|\bcheck\s+in\b", limpa, re.IGNORECASE):
            problemas.append(_problema("grafia", numero, "checkin", "escrever “check-in”"))
        if re.search(rf"\b({SEM_ACENTO})\b", limpa):
            achado = re.search(rf"\b({SEM_ACENTO})\b", limpa, re.IGNORECASE)
            problemas.append(
                _problema("acento", numero, achado.group(0), "revisar a acentuação")
            )
        if re.search(r"\d°", limpa):
            problemas.append(_problema("grafia", numero, "1°", "usar “1º”"))
        for achado in re.finditer(r"\b([A-Za-zÀ-ÿ]{3,})\s+\1\b", limpa, re.IGNORECASE):
            problemas.append(
                _problema("repetição", numero, achado.group(0), "apagar a palavra repetida")
            )

    if texto.count("(") != texto.count(")"):
        problemas.append(_problema("estrutura", 0, "parênteses", "fechar o parêntese"))
    if len(texto) > 3800:
        problemas.append(
            _problema("tamanho", 0, f"{len(texto)} caracteres", "encurtar para menos de 3800")
        )

    if fatos:
        problemas.extend(_conferir_fatos(texto, fatos))

    # Sem repetir o mesmo aviso na mesma linha.
    vistos = set()
    unicos = []
    for item in problemas:
        chave = (item["regra"], item["linha"], item["trecho"])
        if chave in vistos:
            continue
        vistos.add(chave)
        unicos.append(item)
    return unicos


NEGACOES_ANTES_DA_HORA = (
    "não às",
    "nao as",
    "não é às",
    "nao e as",
    "não será às",
    "nao sera as",
    "em vez de",
    "em vez das",
    "em vez da",
)


def _hora_negada(linha, inicio):
    """Verdadeiro quando a hora vem depois de uma negação.

    Aviso de correção escreve a hora errada de propósito (“é às 16h, não às
    15h”). Sem esta exceção, o revisor reprovaria a própria correção.
    """
    antes = linha[:inicio].casefold()
    trecho = antes[-40:]
    return any(negacao in trecho for negacao in NEGACOES_ANTES_DA_HORA)


def _conferir_fatos(texto, fatos):
    problemas = []

    dia = fatos.get("dia")
    semana = fatos.get("semana")
    if dia and semana:
        esperado = f"{semana}, {dia} de novembro"
        if " de novembro" in texto and esperado not in texto:
            problemas.append(
                _problema("data", 0, "data da mensagem", f"usar “{esperado}”")
            )

    horas = {_hora_curta(h) for h in fatos.get("horas", set()) if _hora_curta(h)}
    if horas:
        for linha in texto.split("\n"):
            # A linha de duração fala de "3h30", que não é hora de relógio.
            if linha.strip().startswith("⏱️ Durações estimadas"):
                continue
            for achado in re.finditer(r"\b(\d{1,2}h\d{0,2})\b", linha):
                # "não às 15h" é correção, não programação: não confere.
                if _hora_negada(linha, achado.start()):
                    continue
                chave = _hora_curta(achado.group(1))
                if chave and chave not in horas:
                    problemas.append(
                        _problema("hora", 0, achado.group(1), "hora fora da programação do dia")
                    )

    locais = " | ".join(fatos.get("locais", []))
    tokens = {_sem_acento(t) for t in re.findall(r"Sala[s]?\s+([A-Za-zÀ-ÿ0-9]+)", locais)}
    if tokens:
        for achado in re.finditer(r"\bSala\s+([A-Za-zÀ-ÿ0-9]+)", texto):
            if _sem_acento(achado.group(1)) not in tokens:
                problemas.append(
                    _problema("sala", 0, achado.group(0), "sala fora da programação do dia")
                )

    gds = {int(n) for n in fatos.get("gds", set())}
    if gds:
        for achado in re.finditer(r"\bGD(\d+)\b", texto):
            if int(achado.group(1)) not in gds:
                problemas.append(
                    _problema("GD", 0, achado.group(0), "GD fora da programação do dia")
                )

    return problemas


def formatar(problemas):
    """Uma linha por problema, pronta para o log ou para a tela."""
    if not problemas:
        return "sem problemas"
    saida = []
    for item in problemas:
        onde = f"linha {item['linha']}" if item["linha"] else "texto"
        saida.append(f"- {onde}: {item['regra']} — “{item['trecho']}” → {item['correcao']}")
    return "\n".join(saida)
