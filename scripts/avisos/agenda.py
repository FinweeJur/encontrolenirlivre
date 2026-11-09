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
        "por_dia": {"11": "06:30", "12": "06:30", "13": "06:30", "14": "06:30"},
        "janela": 150,
    },
    {
        "id": "pagamento",
        "tipo": "pagamento",
        "por_dia": {"11": "09:00", "12": "09:00"},
        "janela": 120,
    },
    {
        "id": "comeco",
        "tipo": "comeco",
        "por_dia": {"11": "12:50", "12": "13:20", "13": "13:20"},
        "janela": 25,
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
