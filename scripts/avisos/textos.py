"""
Texto dos avisos do encontro.

A programação não é digitada aqui de novo: sai de `.cache/sessoes.json`, que o
`dump-sessoes.mjs` gera a partir de `src/content/programacaoDetalhada.ts`. Se o
arquivo estiver velho, ele é refeito na hora. Assim, mudar sala ou horário num
lugar só continua valendo para o site e para o aviso.

As durações são estimadas. Quando a programação traz "13h às 16h30", a conta é
exata; quando traz só "18h", vale a tabela por tipo de atividade.
"""
import json
import os
import re
import subprocess
import unicodedata

from .comum import CACHE, PLACAR, PROGRAMA, RAIZ, SITE

DIAS_SEMANA = {
    "quarta": "quarta-feira",
    "quinta": "quinta-feira",
    "sexta": "sexta-feira",
    "sábado": "sábado",
}

ARQUIVO_SESSOES = os.path.join(CACHE, "sessoes.json")
FONTE_PROGRAMA = os.path.join(RAIZ, "src", "content", "programacaoDetalhada.ts")


def _sem_acento(texto):
    decomposto = unicodedata.normalize("NFKD", texto.casefold())
    return "".join(c for c in decomposto if not unicodedata.combining(c))


def garantir_sessoes():
    """Refaz o JSON quando estiver ausente ou mais velho que o programa."""
    precisa = (
        not os.path.exists(ARQUIVO_SESSOES)
        or os.path.getmtime(ARQUIVO_SESSOES) < os.path.getmtime(FONTE_PROGRAMA)
    )
    if precisa:
        subprocess.run(
            ["node", "scripts/dump-sessoes.mjs"],
            cwd=RAIZ,
            check=True,
            capture_output=True,
        )
    with open(ARQUIVO_SESSOES, encoding="utf-8") as arquivo:
        return json.load(arquivo)


def por_dia():
    """Agrupa a lista de atividades por dia, na ordem publicada."""
    mapa = {}
    for item in garantir_sessoes():
        mapa.setdefault(item["dia"], []).append(item)
    return mapa


def _minutos(hora):
    achado = re.match(r"^(\d{1,2})h(\d{2})?", str(hora).strip())
    if not achado:
        return None
    return int(achado.group(1)) * 60 + int(achado.group(2) or 0)


def _intervalo(hora):
    achado = re.search(
        r"(\d{1,2})h(\d{2})?\s*(?:às|as|a)\s*(\d{1,2})h(\d{2})?",
        str(hora),
    )
    if not achado:
        return None
    inicio = int(achado.group(1)) * 60 + int(achado.group(2) or 0)
    fim = int(achado.group(3)) * 60 + int(achado.group(4) or 0)
    if fim <= inicio:
        return None
    return inicio, fim


DURACAO_POR_TIPO = [
    ("chegança", 90),
    ("credenciamento", 60),
    ("gd", 210),
    ("oficina", 120),
    ("plenária", 150),
    ("mesa", 120),
    ("abertura", 120),
    ("lançamento", 90),
    ("luau", 180),
    ("cultural", 180),
    ("roda de conversa", 210),
    ("análise de conjuntura", 210),
    ("memórias", 210),
    ("avanços e desafios", 210),
    ("discussões por região", 150),
    ("experiências contemporâneas", 210),
    ("teorias críticas", 150),
]

ORGANIZACOES = ("RENAP", "RENAJU", "IPDMS", "Conjunta")


def _atividade(titulo):
    """Tira o prefixo da rede: “RENAP — Análise…” vira “Análise…”."""
    texto = str(titulo)
    prefixo, separador, resto = texto.partition(" — ")
    if separador and prefixo in ORGANIZACOES:
        return resto
    return texto


def duracao(item):
    """Duração em minutos. None quando a hora publicada é vaga ("manhã")."""
    faixa = _intervalo(item.get("hora", ""))
    if faixa:
        return faixa[1] - faixa[0]

    titulo = _sem_acento(_atividade(item.get("titulo", "")))
    for chave, minutos in DURACAO_POR_TIPO:
        if titulo.startswith(_sem_acento(chave)):
            return minutos
    return None


def fmt_duracao(minutos):
    if not minutos:
        return ""
    horas, resto = divmod(minutos, 60)
    if resto:
        return f"{horas}h{resto:02d}"
    return f"{horas}h"


def local_curto(texto):
    """Encurta a sala sem perder o prédio."""
    if not texto:
        return ""
    saida = str(texto)
    saida = re.sub(r"Sala ([A-Za-zÀ-ÿ0-9]+) PPGCJ \(CCJ, 1º andar\)", r"Sala \1 do PPGCJ", saida)
    saida = re.sub(r"Salas ([0-9, e]+) PPGCJ \(CCJ, 1º andar\)", r"Salas \1 do PPGCJ", saida)
    saida = saida.replace(" (CCJ, 1º andar)", " (CCJ)")
    saida = re.sub(r"Sala ([A-Za-zÀ-ÿ0-9]+) CCSA", r"Sala \1 (CCSA)", saida)
    saida = re.sub(r"Sala ([A-Za-zÀ-ÿ0-9]+) CCJ", r"Sala \1 (CCJ)", saida)
    saida = re.sub(r"Auditório (\d+) CCHLA", r"Auditório \1 (CCHLA)", saida)
    return saida


def juntar(itens):
    """“a”, “a e b”, “a, b e c”."""
    itens = [i for i in itens if i]
    if not itens:
        return ""
    if len(itens) == 1:
        return itens[0]
    return ", ".join(itens[:-1]) + " e " + itens[-1]


def numeros_gd(titulo):
    return [int(n) for n in re.findall(r"\bGD(\d+)\b", titulo)]


def _todos_gd(itens):
    return len(itens) > 1 and all(item["titulo"].startswith("GD") for item in itens)


def _todas_oficinas(itens):
    return len(itens) > 1 and all(item["titulo"].startswith("Oficina") for item in itens)


def _resumo_salas(itens):
    """Para bloco de GDs: evita nove salas na mesma linha."""
    locais = []
    for item in itens:
        curto = local_curto(item.get("local"))
        if curto and curto not in locais:
            locais.append(curto)

    if not locais:
        return ""
    if len(locais) <= 3:
        return juntar(locais)

    so_ccj = all("CCJ" in l or "PPGCJ" in l for l in locais)
    so_ccsa = all("CCSA" in l for l in locais)
    if so_ccj:
        return "Salas do CCJ"
    if so_ccsa:
        return "Salas do CCSA"
    if all(("CCJ" in l or "PPGCJ" in l or "CCSA" in l) for l in locais):
        return "Salas do CCJ e do CCSA"
    if all("CCHLA" in l for l in locais):
        return "Salas do CCHLA"
    return juntar(locais)


def _lista_gd(itens):
    """“GDs 1, 3, 6 e 7; o GD11 acontece junto com o GD8”."""
    primarios = []
    extras = []
    for item in itens:
        numeros = numeros_gd(item["titulo"])
        if not numeros:
            continue
        primarios.append(numeros[0])
        for extra in numeros[1:]:
            extras.append((extra, numeros[0]))

    primarios = sorted(set(primarios))
    if len(primarios) > 1:
        texto = "GDs " + juntar([str(n) for n in primarios])
    elif primarios:
        texto = f"GD{primarios[0]}"
    else:
        texto = ""

    if extras:
        notas = [f"o GD{e} acontece junto com o GD{p}" for e, p in extras]
        texto += " (" + juntar(notas) + ")"

    return texto


def _titulo_curto(titulo, limite=130):
    texto = str(titulo)
    if texto.startswith("Oficina — "):
        texto = texto[len("Oficina — ") :]
    if len(texto) > limite:
        texto = texto[: limite - 1].rstrip(" ,;:") + "…"
    return texto


def titulo_limpo(titulo):
    """“GD3 — Sistema…” vira “GD3: Sistema…” dentro do aviso."""
    texto = str(titulo)

    if texto.startswith("RENAP — Discussões por região: "):
        return "Discussões por região (RENAP): " + texto[len("RENAP — Discussões por região: ") :]

    if texto.startswith("Chegança — "):
        return "Chegança: a " + texto[len("Chegança — ") :]

    prefixo, separador, resto = texto.partition(" — ")
    if not separador:
        return texto
    conhecidos = ("GD", "Oficina", "Cultural", "RENAP", "RENAJU", "IPDMS", "Mesa", "Plenária")
    if prefixo.startswith(conhecidos) and len(prefixo) <= 14 and ": " not in resto:
        return f"{prefixo}: {resto}"
    return texto


def bloco(hora, itens):
    """Um horário da programação, já formatado para o mensageiro."""
    rotulo_hora = hora
    vaga = _minutos(hora) is None and bool(hora)
    if vaga:
        rotulo_hora = hora[:1].upper() + hora[1:]
    separador = " — "

    if _todos_gd(itens):
        linha = f"• {rotulo_hora}{separador}{_lista_gd(itens)}"
        sala = _resumo_salas(itens)
        if sala:
            linha += f"\n  📍 {sala}"
        return linha

    if _todas_oficinas(itens):
        linhas = [f"• {rotulo_hora}{separador}Oficinas ({len(itens)} opções)"]
        for item in itens:
            linhas.append(f"  • {_titulo_curto(item['titulo'])}")
            if item.get("local"):
                linhas.append(f"    📍 {local_curto(item['local'])}")
        return "\n".join(linhas)

    if len(itens) == 1:
        item = itens[0]
        linha = f"• {rotulo_hora}{separador}{titulo_limpo(item['titulo'])}"
        if item.get("local"):
            linha += f"\n  📍 {local_curto(item['local'])}"
        return linha

    linhas = [f"• {rotulo_hora}{separador}{len(itens)} atividades em paralelo"]
    for item in itens:
        linhas.append(f"  • {titulo_limpo(item['titulo'])}")
        if item.get("local"):
            linhas.append(f"    📍 {local_curto(item['local'])}")
    return "\n".join(linhas)


def _rotulo_duracao(item):
    titulo = _atividade(item.get("titulo", ""))

    simples = [
        ("GD", "GDs"),
        ("Oficina", "oficinas"),
        ("Credenciamento", "credenciamento"),
        ("Chegança", "chegança"),
        ("Abertura", "abertura"),
        ("Luau", "luau"),
        ("Cultural", "cultural"),
        ("Lançamento", "lançamento"),
        ("Plenária", "plenárias"),
        ("Mesa", "mesa"),
        ("Roda de conversa", "roda de conversa"),
        ("Análise de conjuntura", "análise de conjuntura"),
        ("Memórias", "memórias e dilemas"),
        ("Avanços e desafios", "avanços e desafios"),
        ("Discussões por região", "discussões por região"),
        ("Experiências contemporâneas", "experiências de AJUP"),
        ("Teorias críticas", "teorias críticas"),
    ]
    for chave, rotulo in simples:
        if titulo.startswith(chave):
            return rotulo

    # Rótulo curto para o que não está na lista.
    depois = titulo.split(":")[0].strip()
    curto = ""
    for palavra in depois.split():
        if len(curto) + len(palavra) + 1 > 34:
            break
        curto = (curto + " " + palavra).strip()

    paradas = {"de", "da", "do", "das", "dos", "e", "em", "para", "com", "sobre", "a", "o", "as", "os"}
    palavras = curto.split()
    while palavras and palavras[-1].lower() in paradas:
        palavras.pop()
    curto = " ".join(palavras) or depois[:34]
    return curto.lower()


def _linha_duracoes(itens):
    ordem = []
    valores = {}
    for item in itens:
        minutos = duracao(item)
        if not minutos:
            continue
        rotulo = _rotulo_duracao(item)
        if rotulo not in valores:
            ordem.append(rotulo)
            valores[rotulo] = minutos
        else:
            valores[rotulo] = max(valores[rotulo], minutos)

    if not ordem:
        return ""
    partes = [f"{rotulo}: {fmt_duracao(valores[rotulo])}" for rotulo in ordem]
    return "⏱️ Durações estimadas — " + "; ".join(partes) + "."


def resumo_dia(dia):
    """Mensagem da manhã com o dia inteiro."""
    itens = por_dia().get(dia, [])
    if not itens:
        return ""

    semana = DIAS_SEMANA.get(itens[0]["semana"], itens[0]["semana"])
    if dia == "11":
        abertura = (
            f"☀️ Bom dia! Hoje é {semana}, {dia} de novembro.\n\n"
            "Começam hoje o 30º Encontro Nacional da RENAP, o XI Seminário do "
            "IPDMS e o 20º Encontro da RENAJU, em João Pessoa."
        )
    elif dia == "14":
        abertura = (
            f"☀️ Bom dia! Hoje é {semana}, {dia} de novembro.\n\n"
            "Último dia do encontro, em João Pessoa."
        )
    else:
        abertura = (
            f"☀️ Bom dia! Hoje é {semana}, {dia} de novembro.\n\n"
            "O encontro segue em João Pessoa."
        )

    linhas = [abertura, "", "📋 O que acontece hoje", ""]

    # Agrupa por horário no dia inteiro, não só quando os itens são vizinhos:
    # a programação lista 14h, 14h30 e 14h de novo, e isso abria dois blocos.
    ordem = []
    grupos = {}
    for item in itens:
        if item["hora"] not in grupos:
            ordem.append(item["hora"])
            grupos[item["hora"]] = []
        grupos[item["hora"]].append(item)

    for hora in ordem:
        linhas.append(bloco(hora, grupos[hora]))
        linhas.append("")

    duracoes = _linha_duracoes(itens)
    if duracoes:
        linhas.append(duracoes)
        linhas.append("")

    linhas.append("🗓️ Programação completa, com salas e horários:")
    linhas.append(PROGRAMA)
    return "\n".join(linhas).strip()


def periodo_do_dia(hora):
    """“hoje de manhã”, “hoje à tarde”, “hoje à noite”."""
    achado = re.match(r"^(\d{1,2})h", str(hora).strip())
    if not achado:
        return "no encontro"
    h = int(achado.group(1))
    if h < 12:
        return "hoje de manhã"
    if h < 18:
        return "hoje à tarde"
    return "hoje à noite"


def texto_marco(marco, titulo, hora):
    """Aviso de marco do check-in, com concordância certa também no 1."""
    if marco == 1:
        abertura = "🎯 Já temos 1 check-in"
    else:
        abertura = f"🎯 Já temos {marco} check-ins"
    return (
        f"{abertura} {periodo_do_dia(hora)} na atividade {titulo_limpo(titulo)}.\n"
        f"Placar do check-in: {PLACAR}"
    )


def pagamento():
    """Lembrete de taxa, para quem já se inscreveu e ainda não pagou."""
    return (
        "💳 Você ainda não pagou a taxa?\n\n"
        "Se você se inscreveu no SIGEventos da UFPB e ainda não pagou, "
        "faça o PIX e envie o comprovante por e-mail.\n\n"
        "PIX, comprovante e dúvidas: ipdmscorreio@gmail.com\n\n"
        "Valores: R$ 100 para profissionais, pós-graduação e advogadas/os; "
        "R$ 50 para estudantes de graduação.\n\n"
        f"Site do encontro: {SITE}"
    )


def comeco(dia):
    """Aviso do bloco que começa à tarde."""
    itens = [item for item in por_dia().get(dia, []) if item["hora"].startswith("13h")]
    if not itens:
        return ""

    if any(item["titulo"].startswith("GD") for item in itens):
        numeros = sorted({n for item in itens for n in numeros_gd(item["titulo"])})
        manchete = "GDs"
        if any("regiões" in item["titulo"] or "região" in item["titulo"] for item in itens):
            manchete += " e discussões por região da RENAP"
        if numeros:
            manchete = f"{len(numeros)} GDs em paralelo"
            if any("regiões" in item["titulo"] or "região" in item["titulo"] for item in itens):
                manchete += " + discussões por região da RENAP"
        sala = "Salas do CCJ e do CCSA"
    elif all(item["titulo"].startswith("Plenária") for item in itens):
        manchete = "Plenárias do IPDMS e da RENAJU"
        sala = _resumo_salas(itens) or "Auditórios 411 e 412 do CCHLA"
    elif any(item["titulo"].startswith("Plenária") for item in itens):
        renaju = next(
            (item["titulo"] for item in itens if item["titulo"].startswith("RENAJU")),
            "",
        )
        if renaju:
            nome = renaju.split(" — ", 1)[-1]
            manchete = f"Plenária do IPDMS e RENAJU: {nome}"
        else:
            manchete = "Plenária do IPDMS"
        sala = _resumo_salas(itens)
    else:
        manchete = juntar([item["titulo"] for item in itens])
        sala = _resumo_salas(itens)

    hora = itens[0]["hora"].split(" às ")[0]
    linhas = ["⏰ Começando agora", "", f"• {hora} — {manchete}"]
    if sala:
        linhas.append(f"  📍 {sala}")
    linhas.extend(["", "Programação completa:", PROGRAMA])
    return "\n".join(linhas)


def fatos_do_dia(dia):
    """O que o revisor pode conferir contra a programação real."""
    itens = por_dia().get(dia, [])
    if not itens:
        return None
    gds = set()
    horas = set()
    for item in itens:
        gds.update(numeros_gd(item["titulo"]))
        for achado in re.finditer(r"\b(\d{1,2}h\d{0,2})\b", str(item["hora"])):
            horas.add(achado.group(1))
    return {
        "dia": dia,
        "semana": DIAS_SEMANA.get(itens[0]["semana"], itens[0]["semana"]),
        "horas": horas,
        "locais": [item["local"] for item in itens if item.get("local")],
        "gds": gds,
    }
