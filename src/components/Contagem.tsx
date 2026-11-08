/**
 * Contagem do prazo: dias para o encontro e tempo até o fim das inscrições.
 *
 * Duas peças, uma conta só:
 * - `FaltamDias`: quantos dias faltam para 11/11, para ficar no topo da página.
 * - `ContagemInscricoes`: cronômetro até 23h59 de 6/11, para a seção de
 *   inscrições.
 *
 * O relógio é do navegador de quem lê — nada de servidor. Se o aparelho estiver
 * com a data errada, a contagem erra também; por isso o texto ao lado sempre
 * diz a data por extenso.
 */
import { useEffect, useState } from "react";
import "../styles/contagem.css";

/** 6 de novembro de 2026, 23h59 no horário de Brasília. */
const FIM_INSCRICOES = new Date("2026-11-06T23:59:59-03:00").getTime();
/** Abertura do encontro, 11 de novembro de 2026. */
const INICIO_EVENTO = new Date("2026-11-11T09:00:00-03:00").getTime();
/** Último minuto do encontro, 14 de novembro de 2026. */
const FIM_EVENTO = new Date("2026-11-14T23:59:59-03:00").getTime();

type Conta = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  acabou: boolean;
};

function calcular(alvo: number, agora: number): Conta {
  const resta = alvo - agora;
  if (resta <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, acabou: true };
  }
  const segundos = Math.floor(resta / 1000);
  return {
    dias: Math.floor(segundos / 86400),
    horas: Math.floor((segundos % 86400) / 3600),
    minutos: Math.floor((segundos % 3600) / 60),
    segundos: segundos % 60,
    acabou: false,
  };
}

/** Relógio compartilhado: atualiza a cada segundo, só no cliente. */
function useAgora(): number {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(relogio);
  }, []);

  return agora;
}

const dois = (n: number) => String(n).padStart(2, "0");

/** Dia civil no relógio de Brasília, como número (dias desde 1970). */
function diaBrasilia(ms: number): number {
  return Math.floor((ms - 3 * 3_600_000) / 86_400_000);
}

/** "Faltam 6 dias" — ou o que for verdade no dia da leitura. */
export function FaltamDias({ className = "" }: { className?: string }) {
  const agora = useAgora();
  // Conta por dia do calendário, não por 24 horas: na manhã do dia 11 já é
  // "é hoje", não "falta 1 dia".
  const dias = diaBrasilia(INICIO_EVENTO) - diaBrasilia(agora);

  const texto =
    agora >= FIM_EVENTO
      ? "Encontro encerrado"
      : agora >= INICIO_EVENTO
        ? `Dia ${diaBrasilia(agora) - diaBrasilia(INICIO_EVENTO) + 1} de 4`
        : dias <= 0
          ? "É hoje"
          : dias === 1
            ? "Falta 1 dia"
            : `Faltam ${dias} dias`;

  return (
    <span className={`faltam ${className}`.trim()}>
      <span className="faltam__ponto" aria-hidden="true" />
      {texto}
    </span>
  );
}

/** Cronômetro das inscrições, com a data por extenso ao lado. */
export function ContagemInscricoes() {
  const agora = useAgora();
  const conta = calcular(FIM_INSCRICOES, agora);

  if (conta.acabou) {
    return (
      <div className="contagem contagem--fim">
        <p className="contagem__rotulo">Inscrições</p>
        <p className="contagem__texto">
          Encerradas em <strong>6 de novembro de 2026</strong>. Dúvidas sobre
          pagamento e isenção seguem pelo e-mail da secretaria.
        </p>
      </div>
    );
  }

  return (
    <div className="contagem">
      <p className="contagem__rotulo">
        As inscrições fecham em 6 de novembro
      </p>

      <div className="contagem__relogio" role="timer" aria-live="off">
        <span className="contagem__bloco">
          <strong>{conta.dias}</strong>
          <small>{conta.dias === 1 ? "dia" : "dias"}</small>
        </span>
        <span className="contagem__bloco">
          <strong>{dois(conta.horas)}</strong>
          <small>horas</small>
        </span>
        <span className="contagem__bloco">
          <strong>{dois(conta.minutos)}</strong>
          <small>min</small>
        </span>
        <span className="contagem__bloco">
          <strong>{dois(conta.segundos)}</strong>
          <small>seg</small>
        </span>
      </div>

      <p className="contagem__pe">
        Prazo final: 6 de novembro de 2026, 23h59 (horário de Brasília).
      </p>
    </div>
  );
}
