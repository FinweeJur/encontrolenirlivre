"""
Avisa a comissão quando uma atividade passa de 50, 100, 150, 200 ou 250
presenças, no Telegram e no WhatsApp.

Como funciona:
  1. lê /api/resumo do site (protegido por senha);
  2. compara com o estado salvo em `.cache/avisos-estado.json`;
  3. quando cruza um marco, monta a mensagem, passa pelo revisor e dispara
     nos dois canais;
  4. se o WhatsApp estiver fora, guarda na fila e tenta na próxima volta.

O texto do aviso mora em `avisos/textos.py`, junto com o da programação, para
a concordância ser a mesma nos dois. O link é o placar público: o painel com
nomes continua protegido por senha.

Roda de minuto em minuto pelo Agendador de Tarefas. Nada de token em log.
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from avisos import comum, revisor, textos  # noqa: E402

ESTADO = os.path.join(comum.CACHE, "avisos-estado.json")
VALIDADE_FILA = 120  # minutos

MARCOS = [50, 100, 150, 200, 250, 300, 400, 500]

# Teste: `MARCOS=1,2` no ambiente troca os marcos sem mexer no código.
_do_env = [
    int(x)
    for x in os.environ.get("MARCOS", "").replace(" ", "").split(",")
    if x.isdigit()
]
if _do_env:
    MARCOS = _do_env


def resumo():
    token = comum.ler_token()
    url = f"{comum.SITE}/api/resumo?token={urllib.parse.quote(token)}"
    req = urllib.request.Request(url, headers={"user-agent": comum.UA})
    with urllib.request.urlopen(req, timeout=30) as resposta:
        return json.loads(resposta.read().decode("utf-8"))


def carregar_estado():
    estado = comum.ler_json(ESTADO, {})
    estado.setdefault("enviados", {})
    estado.setdefault("fila", [])
    return estado


def entregar_fila(estado):
    agora = comum.agora_br()
    restantes = []
    for item in estado.get("fila", []):
        expira = item.get("expira")
        if expira:
            try:
                if agora > datetime.fromisoformat(expira):
                    print(f"fila: expirado {item.get('sessao')} marco {item.get('marco')}")
                    continue
            except ValueError:
                pass
        alvos = item.get("faltando") or None
        ok, motivo, falhas = comum.whatsapp_grupos(item["texto"], alvos)
        print(f"fila: marco {item.get('marco')} {motivo}")
        if not ok:
            item["faltando"] = falhas
            restantes.append(item)
    estado["fila"] = restantes


def main():
    if not comum.ler_token():
        print("sem PRESENCA_TOKEN no ambiente nem no arquivo local")
        return 1

    estado = carregar_estado()
    enviados = estado["enviados"]
    fila = estado["fila"]
    entregar_fila(estado)

    dados = resumo()
    env = comum.ler_env()
    novos = 0
    bloqueados = 0

    for atividade in dados.get("atividades", []):
        total = atividade.get("total", 0)
        chave = atividade.get("chave", "")
        if not chave:
            continue

        feitos = set(enviados.get(chave, []))
        for marco in MARCOS:
            if total < marco or marco in feitos:
                continue

            texto = textos.texto_marco(marco, atividade.get("titulo", ""), atividade.get("hora", ""))
            problemas = revisor.revisar(texto)
            if problemas:
                bloqueados += 1
                print(f"BLOQUEADO {chave} marco {marco}:")
                print(revisor.formatar(problemas))
                continue

            ok_t, motivo_t = comum.telegram(texto, env)
            ok_w, motivo_w, falhas = comum.whatsapp_grupos(texto)
            print(f"{chave} marco {marco}: {motivo_t} | {motivo_w}")

            if not ok_w:
                fila.append(
                    {
                        "sessao": chave,
                        "marco": marco,
                        "texto": texto,
                        "faltando": falhas,
                        "expira": (
                            comum.agora_br().replace(microsecond=0)
                            + timedelta(minutes=VALIDADE_FILA)
                        ).isoformat(),
                    }
                )

            if ok_t or ok_w:
                feitos.add(marco)
                novos += 1

            time.sleep(0.4)

        if feitos:
            enviados[chave] = sorted(feitos)

    comum.salvar_json(ESTADO, estado)
    print(
        f"total de presenças: {dados.get('total')} | avisos novos: {novos} | "
        f"bloqueados: {bloqueados} | fila: {len(fila)}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
