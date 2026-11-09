"""
Horário dos avisos automáticos.

Cada aviso tem uma hora e uma janela. A janela existe para o caso de a máquina
estar desligada na hora exata: se ela voltar dentro do prazo, o aviso ainda sai;
se voltar depois, é melhor não mandar "bom dia" às três da tarde.

Horário de Brasília, sem horário de verão desde 2019.
"""
import datetime

from .comum import FUSO

ANO = 2026
MES = 11

# id, tipo e horário por dia. A janela é em minutos.
AGENDA = [
    {
        "id": "bom-dia",
        "tipo": "bom-dia",
        "por_dia": {
            "9": "07:00",
            "10": "07:00",
            "11": "07:00",
            "12": "07:00",
            "13": "07:00",
            "14": "07:00",
        },
        "janela": 150,
    },
    {
        "id": "boa-noite",
        "tipo": "boa-noite",
        "por_dia": {
            "9": "20:00",
            "10": "20:00",
            "11": "20:00",
            "12": "20:00",
            "13": "20:00",
            "14": "20:00",
        },
        "janela": 120,
    },
]


def minutos(hhmm):
    hora, _, minuto = hhmm.partition(":")
    return int(hora) * 60 + int(minuto or 0)


def chave(dia, identificador):
    return f"{ANO}-{MES:02d}-{int(dia):02d}|{identificador}"


def avisos_do_dia(dia):
    """Todos os avisos previstos para o dia, com a hora resolvida."""
    saida = []
    for aviso in AGENDA:
        hora = aviso["por_dia"].get(str(dia))
        if not hora:
            continue
        saida.append({**aviso, "dia": str(dia), "hora": hora})
    return saida


def devidos(agora=None):
    """Avisos cuja janela está aberta neste minuto."""
    agora = agora or datetime.datetime.now(FUSO)
    if agora.year != ANO or agora.month != MES:
        return []

    dia = str(agora.day)
    minutos_agora = agora.hour * 60 + agora.minute
    saida = []
    for aviso in avisos_do_dia(dia):
        atraso = minutos_agora - minutos(aviso["hora"])
        if 0 <= atraso <= aviso["janela"]:
            saida.append({**aviso, "atraso": atraso})
    return saida
