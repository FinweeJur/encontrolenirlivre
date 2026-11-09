"""
Avisador da programação do encontro (11 a 14 de novembro de 2026).

Manda três tipos de mensagem, por Telegram e WhatsApp:

  bom-dia   06h30  o dia inteiro, com horário, sala e duração estimada;
  pagamento 09h00  lembrete de taxa para quem ainda não pagou (dias 11 e 12);
  comeco    12h50  o bloco da tarde que está começando.

Antes de qualquer disparo, o texto passa pelo revisor determinístico. Texto
com problema de concordância, hora, sala ou GD não sai: fica no log.

O agendamento é externo: o Agendador de Tarefas roda este arquivo a cada
5 minutos. A janela de cada aviso está em `avisos/agenda.py`.

Uso:
  python scripts/avisar-programa.py               # envia o que estiver na janela
  python scripts/avisar-programa.py --ensaiar     # mostra tudo, sem enviar
  python scripts/avisar-programa.py --status
  python scripts/avisar-programa.py --forcar bom-dia --dia 11

O ensaio também grava `.cache/avisos-preview.json` para revisão externa.
"""
import argparse
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from avisos import agenda, comum, revisor, textos  # noqa: E402

ESTADO = os.path.join(comum.CACHE, "avisos-programa.json")
PREVIEW = os.path.join(comum.CACHE, "avisos-preview.json")


def montar(aviso):
    """Devolve (texto, fatos) do aviso."""
    tipo = aviso["tipo"]
    dia = aviso["dia"]
    if tipo == "bom-dia":
        if dia in ("9", "10"):
            return textos.bom_dia_antes(dia), None
        return textos.resumo_dia(dia), textos.fatos_do_dia(dia)
    if tipo == "boa-noite":
        fatos = None
        if dia in ("11", "12", "13"):
            fatos = textos.fatos_do_dia(str(int(dia) + 1))
        return textos.boa_noite(dia), fatos
    raise ValueError(f"tipo de aviso desconhecido: {tipo}")


def carregar_estado():
    estado = comum.ler_json(ESTADO, {})
    estado.setdefault("enviados", {})
    estado.setdefault("fila", [])
    return estado


def entregar_fila(estado):
    """Tenta de novo o WhatsApp que ficou para trás. Descarta o que venceu."""
    agora = comum.agora_br()
    restantes = []
    for item in estado.get("fila", []):
        try:
            expira = datetime.fromisoformat(item["expira"])
        except (KeyError, ValueError):
            continue
        if agora > expira:
            print(f"fila: expirado {item.get('chave')}")
            continue
        ok, motivo, _ = comum.whatsapp(item["texto"])
        print(f"fila: {item.get('chave')} {motivo}")
        if not ok:
            restantes.append(item)
    estado["fila"] = restantes


def disparar(aviso, texto, problemas, marcar=True, com_whatsapp=True):
    """Revisa, envia e devolve o resultado. Texto reprovado não sai."""
    if problemas:
        print(f"BLOQUEADO {aviso['id']} {aviso['dia']}: revisor achou problema")
        print(revisor.formatar(problemas))
        return "bloqueado"

    env = comum.ler_env()
    ok_t, motivo_t = comum.telegram(texto, env)
    if com_whatsapp:
        ok_w, motivo_w, _ = comum.whatsapp(texto)
    else:
        ok_w, motivo_w = False, "whatsapp desligado no teste"
    print(f"{aviso['id']} {aviso['dia']}: {motivo_t} | {motivo_w}")

    if marcar and (ok_t or ok_w):
        return "enviado" if not ok_w else "parcial"
    if marcar:
        return "falhou"
    return "teste"


def executar():
    estado = carregar_estado()
    entregar_fila(estado)

    pendentes = agenda.devidos()
    if not pendentes:
        comum.salvar_json(ESTADO, estado)
        print("nada na janela agora")
        return 0

    for aviso in pendentes:
        chave = agenda.chave(aviso["dia"], aviso["id"])
        if chave in estado["enviados"]:
            continue

        texto, fatos = montar(aviso)
        if not texto:
            print(f"sem texto para {chave}")
            continue

        problemas = revisor.revisar(texto, fatos)
        resultado = disparar(aviso, texto, problemas)

        if resultado in ("enviado", "parcial"):
            estado["enviados"][chave] = {
                "quando": comum.agora_br().isoformat(timespec="seconds"),
                "resultado": resultado,
            }
            if resultado == "parcial":
                validade = max(30, aviso["janela"])
                estado["fila"].append(
                    {
                        "chave": chave,
                        "expira": (
                            comum.agora_br().replace(microsecond=0)
                            + timedelta(minutes=validade)
                        ).isoformat(),
                        "texto": texto,
                    }
                )
        elif resultado == "falhou":
            print(f"{chave}: nenhum canal entregou; tenta de novo na próxima volta")

    comum.salvar_json(ESTADO, estado)
    return 0


def ensaiar(dia=None):
    dias = [dia] if dia else ["9", "10", "11", "12", "13", "14"]
    itens = []

    for d in dias:
        for aviso in agenda.avisos_do_dia(d):
            texto, fatos = montar(aviso)
            problemas = revisor.revisar(texto, fatos)
            item = {
                "chave": agenda.chave(d, aviso["id"]),
                "tipo": aviso["tipo"],
                "dia": d,
                "hora": aviso["hora"],
                "texto": texto,
                "problemas": problemas,
            }
            itens.append(item)

            print("=" * 72)
            print(f"{item['chave']} — {aviso['hora']} — {len(texto)} caracteres")
            print("=" * 72)
            print(texto)
            print("-" * 72)
            print(revisor.formatar(problemas))
            print()

    # Amostra do aviso de check-in, para o revisor conferir a concordância.
    for marco in (1, 50):
        texto = textos.texto_marco(
            marco,
            "GD3 — Sistema de justiça e conflitos fundiários",
            "13h às 16h30",
        )
        problemas = revisor.revisar(texto)
        itens.append(
            {
                "chave": f"checkin-marco-{marco}",
                "tipo": "checkin",
                "dia": "",
                "hora": "",
                "texto": texto,
                "problemas": problemas,
            }
        )
        print("=" * 72)
        print(f"checkin-marco-{marco}")
        print("=" * 72)
        print(texto)
        print("-" * 72)
        print(revisor.formatar(problemas))
        print()

    comum.salvar_json(PREVIEW, itens)
    total = sum(len(i["problemas"]) for i in itens)
    print(f"ensaiadas {len(itens)} mensagens; {total} problema(s) de revisão")
    return 0 if total == 0 else 1


def forcar(identificador, dia, com_whatsapp=False, marcar=False):
    aviso = next(
        (a for a in agenda.avisos_do_dia(dia) if a["id"] == identificador),
        None,
    )
    if not aviso:
        print(f"aviso {identificador} não existe no dia {dia}")
        return 1

    texto, fatos = montar(aviso)
    problemas = revisor.revisar(texto, fatos)
    print(texto)
    print("-" * 72)
    print(revisor.formatar(problemas))
    if problemas:
        return 1

    resultado = disparar(
        aviso, texto, problemas, marcar=marcar, com_whatsapp=com_whatsapp
    )
    print(f"resultado do teste: {resultado}")
    if marcar and resultado in ("enviado", "parcial"):
        estado = carregar_estado()
        estado["enviados"][agenda.chave(dia, identificador)] = {
            "quando": comum.agora_br().isoformat(timespec="seconds"),
            "resultado": resultado,
        }
        comum.salvar_json(ESTADO, estado)
    return 0


def status():
    agora = comum.agora_br()
    estado = carregar_estado()
    print(f"agora: {agora.isoformat(timespec='seconds')}")
    print(f"enviados: {len(estado['enviados'])}")
    for chave, info in sorted(estado["enviados"].items()):
        print(f"  {chave} — {info.get('resultado')} em {info.get('quando')}")
    print(f"fila do WhatsApp: {len(estado['fila'])}")
    for item in estado["fila"]:
        print(f"  {item.get('chave')} até {item.get('expira')}")
    print("na janela agora:")
    for aviso in agenda.devidos(agora):
        print(f"  {aviso['id']} do dia {aviso['dia']} ({aviso['hora']})")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Avisos da programação do encontro.")
    parser.add_argument("--ensaiar", action="store_true", help="mostra tudo, sem enviar")
    parser.add_argument("--dia", help="dia do encontro (9 a 14)")
    parser.add_argument("--forcar", help="id do aviso para testar")
    parser.add_argument("--com-whatsapp", action="store_true", help="teste também no WhatsApp")
    parser.add_argument("--marcar", action="store_true", help="marca o aviso forçado como enviado")
    parser.add_argument("--status", action="store_true", help="mostra o estado")
    args = parser.parse_args()

    if args.ensaiar:
        return ensaiar(args.dia)
    if args.forcar:
        dia = args.dia or str(comum.agora_br().day)
        return forcar(args.forcar, dia, args.com_whatsapp, args.marcar)
    if args.status:
        return status()
    return executar()


if __name__ == "__main__":
    sys.exit(main())
