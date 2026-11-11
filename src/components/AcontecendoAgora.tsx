/**
 * Faixa "Acontecendo agora" — o que está rolando no encontro neste minuto.
 *
 * Fica logo abaixo da navbar, no topo do hero das duas páginas. Durante os
 * dias 11 a 14 de novembro de 2026 mostra uma atividade em andamento; se não
 * houver nenhuma, mostra a próxima do dia (ou a primeira do dia seguinte).
 * Fora desses dias não renderiza nada.
 *
 * O relógio é o do aparelho, deslocado em -3 h e lido com getters UTC: assim a
 * data é sempre a de Brasília, mesmo que o celular esteja em outro fuso. É o
 * mesmo recurso de `Contagem.tsx`.
 *
 * Fonte dos dados: `content/programacaoDetalhada.ts`, a mesma lista das abas
 * de programação. A faixa não importa `LocalComMapa` de propósito: ali há
 * links de mapa que não cabem numa linha, e o import criaria dependência
 * circular com o bloco de programação.
 */
import { useEffect, useState } from "react";
import { programaDetalhado } from "../content/programacaoDetalhada";
import type { ItemPrograma } from "../content/programacaoDetalhada";
import "../styles/acontecendo.css";

/** Brasília é UTC-3 o ano inteiro (o Brasil não usa mais horário de verão). */
const FUSO_BRASILIA_MS = -3 * 3_600_000;

const ANO = 2026;
const MES = 11;
const PRIMEIRO_DIA = 11;
const ULTIMO_DIA = 14;

/** Item com hora única fica "acontecendo" por uma hora. */
const DURACAO_PADRAO_MIN = 60;

/** Primeiro e último dia do encontro, como chaves comparáveis de calendário. */
const INICIO_EVENTO = Date.UTC(ANO, MES - 1, PRIMEIRO_DIA);
const FIM_EVENTO = Date.UTC(ANO, MES - 1, ULTIMO_DIA);

type Faixa = {
  /** Minutos desde a meia-noite de Brasília. */
  inicio: number;
  fim: number;
  item: ItemPrograma;
  dia: number;
  semana: string;
};

type DiaIndexado = {
  dia: number;
  semana: string;
  /** Só as atividades com hora numérica, em ordem de início. */
  faixas: Faixa[];
};

type Situacao =
  | { tipo: "acontecendo"; faixa: Faixa; outras: number }
  | { tipo: "seguir"; faixa: Faixa; dias: number }
  | { tipo: "encerrado" };

type Relogio = {
  ano: number;
  mes: number;
  dia: number;
  /** Minutos desde a meia-noite de Brasília. */
  minuto: number;
};

/** "13h", "8h30" — e nada mais. */
const HORA_NUMERICA = /^(\d{1,2})h(\d{2})?$/;

/** Converte "13h30" em 810 minutos. Devolve null para texto ("manhã"). */
function minutosDaHora(texto: string): number | null {
  const achado = HORA_NUMERICA.exec(texto.trim());
  if (!achado) return null;

  const horas = Number(achado[1]);
  const minutos = achado[2] ? Number(achado[2]) : 0;
  if (horas > 23 || minutos > 59) return null;

  return horas * 60 + minutos;
}

/**
 * Entende "13h", "8h30", "12h às 13h" e "13h às 16h30".
 * Ignora textos como "manhã", "depois da mesa" e "depois das plenárias":
 * sem hora não dá para saber se está acontecendo, então ficam de fora.
 */
function lerHorario(hora: string): { inicio: number; fim: number } | null {
  const trechos = hora.split(" às ");

  if (trechos.length === 2) {
    const inicio = minutosDaHora(trechos[0]);
    const fim = minutosDaHora(trechos[1]);
    if (inicio === null || fim === null || fim <= inicio) return null;
    return { inicio, fim };
  }

  const inicio = minutosDaHora(hora);
  if (inicio === null) return null;
  return { inicio, fim: inicio + DURACAO_PADRAO_MIN };
}

/**
 * A lista de horas é montada uma vez, no carregamento do módulo: são poucos
 * itens e o dado é estático. Cada dia já sai ordenado pelo início.
 */
const DIAS: DiaIndexado[] = programaDetalhado.map((dia) => {
  const numero = Number(dia.dia);
  const faixas = dia.itens.flatMap<Faixa>((item) => {
    const janela = lerHorario(item.hora);
    if (!janela) return [];
    return [{ ...janela, item, dia: numero, semana: dia.semana }];
  });

  faixas.sort((a, b) => a.inicio - b.inicio);

  return { dia: numero, semana: dia.semana, faixas };
});

/** Relógio de Brasília, independente do fuso configurado no aparelho. */
function relogioBrasilia(ms: number): Relogio {
  const deslocado = new Date(ms + FUSO_BRASILIA_MS);
  return {
    ano: deslocado.getUTCFullYear(),
    mes: deslocado.getUTCMonth() + 1,
    dia: deslocado.getUTCDate(),
    minuto: deslocado.getUTCHours() * 60 + deslocado.getUTCMinutes(),
  };
}

/** 810 → "13h30"; 480 → "8h". */
function formatarHora(minutos: number): string {
  const hora = Math.floor(minutos / 60);
  const minuto = minutos % 60;
  return minuto === 0 ? `${hora}h` : `${hora}h${String(minuto).padStart(2, "0")}`;
}

/**
 * Escolhe o que mostrar. Se houver mais de uma atividade em andamento (os GDs
 * correm em paralelo), fica com a que começou por último — é a mais provável
 * de ser a novidade do horário.
 */
function resolver(indice: number, minuto: number): Situacao {
  const hoje = DIAS[indice];

  const emCurso = hoje.faixas.reduce<Faixa | null>((melhor, faixa) => {
    const dentro = faixa.inicio <= minuto && minuto < faixa.fim;
    if (!dentro) return melhor;
    if (!melhor || faixa.inicio > melhor.inicio) return faixa;
    return melhor;
  }, null);

  if (emCurso) {
    // Quantas outras atividades correm no mesmo horário: às 13h do dia 11 são
    // dez GDs em salas diferentes, e a faixa não pode fingir que é uma só.
    const simultaneas = hoje.faixas.filter(
      (faixa) => faixa.inicio <= minuto && minuto < faixa.fim,
    ).length;

    return { tipo: "acontecendo", faixa: emCurso, outras: Math.max(0, simultaneas - 1) };
  }

  const proxima = hoje.faixas.find((faixa) => faixa.inicio > minuto);
  if (proxima) return { tipo: "seguir", faixa: proxima, dias: 0 };

  // Dia sem mais atividades: procura o primeiro item do próximo dia que tenha
  // pelo menos uma hora numérica. Normalmente é o dia seguinte, mas o laço
  // cobre um dia inteiro sem horários.
  for (let i = indice + 1; i < DIAS.length; i += 1) {
    const primeira = DIAS[i].faixas[0];
    if (primeira) return { tipo: "seguir", faixa: primeira, dias: i - indice };
  }

  return { tipo: "encerrado" };
}

function rotuloDe(situacao: Situacao): string {
  switch (situacao.tipo) {
    case "acontecendo":
      return "Acontecendo agora";
    case "seguir":
      return "A seguir";
    case "encerrado":
      return "Encerrado";
  }
}

/** Prefixo visual do horário: "13h30" hoje, "Amanhã, 12/11, 8h30" adiante. */
function prefixoDe(situacao: Situacao): string | null {
  if (situacao.tipo !== "seguir") return null;

  const hora = formatarHora(situacao.faixa.inicio);
  if (situacao.dias === 0) return hora;

  const data = `${situacao.faixa.dia}/${MES}`;
  return situacao.dias === 1
    ? `Amanhã, ${data}, ${hora}`
    : `${situacao.faixa.semana}, ${data}, ${hora}`;
}

/**
 * Frase inteira para leitor de tela. A linha visual é `aria-hidden` e esta é
 * a única fonte de voz: evita ouvir "hífen", "ponto médio" e siglas soltas.
 */
function fraseDe(situacao: Situacao): string {
  if (situacao.tipo === "encerrado") {
    return "Encerrado. A programação do encontro terminou.";
  }

  const { faixa } = situacao;
  const local = faixa.item.local ? ` Local: ${faixa.item.local}.` : "";
  const organizacao = ` Organização: ${faixa.item.tag}.`;
  const hora = formatarHora(faixa.inicio);

  if (situacao.tipo === "acontecendo") {
    const mais =
      situacao.outras > 0
        ? ` Mais ${situacao.outras} atividade${situacao.outras > 1 ? "s" : ""} no mesmo horário.`
        : "";
    return `Acontecendo agora: ${faixa.item.titulo}.${local}${organizacao}${mais}`;
  }

  if (situacao.dias === 0) {
    return `A seguir, às ${hora}: ${faixa.item.titulo}.${local}${organizacao}`;
  }

  const quando =
    situacao.dias === 1
      ? `Amanhã, ${faixa.dia} de novembro`
      : `${faixa.semana}, ${faixa.dia} de novembro`;

  return `A seguir, ${quando}, às ${hora}: ${faixa.item.titulo}.${local}${organizacao}`;
}

export function AcontecendoAgora() {
  // Estado inicial já com o relógio; o intervalo só mantém a faixa em dia.
  const [agora, setAgora] = useState(() => Date.now());
  // Seta para abrir a lista das outras atividades do mesmo horário.
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(Date.now()), 60_000);
    return () => window.clearInterval(relogio);
  }, []);

  const relogio = relogioBrasilia(agora);
  const chaveHoje = Date.UTC(relogio.ano, relogio.mes - 1, relogio.dia);

  if (chaveHoje < INICIO_EVENTO || chaveHoje > FIM_EVENTO) return null;

  const indice = DIAS.findIndex((dia) => dia.dia === relogio.dia);
  if (indice < 0) return null;

  const situacao = resolver(indice, relogio.minuto);
  const faixa = situacao.tipo === "encerrado" ? null : situacao.faixa;
  const prefixo = prefixoDe(situacao);
  const vivo = situacao.tipo === "acontecendo";
  // Quantas outras atividades correm junto: define se a barra inteira é
  // clicável para abrir a lista.
  const outras = situacao.tipo === "acontecendo" ? situacao.outras : 0;
  const abrivel = outras > 0;
  const emCurso =
    situacao.tipo === "acontecendo"
      ? DIAS[indice].faixas.filter(
          (f) => f.inicio <= relogio.minuto && relogio.minuto < f.fim,
        )
      : [];

  return (
    <div
      className={`acontecendo${vivo ? " acontecendo--vivo" : ""}${abrivel ? " acontecendo--clicavel" : ""}`}
      role="status"
      aria-live="polite"
      data-aberto={abrivel && aberto ? "true" : undefined}
    >
      <span className="acontecendo__rotulo" aria-hidden="true">
        <span className="acontecendo__ponto" aria-hidden="true" />
        {rotuloDe(situacao)}
      </span>

      <span className="acontecendo__texto" aria-hidden="true">
        {prefixo ? (
          <>
            <span className="acontecendo__hora">{prefixo}</span>
            <span className="acontecendo__sep"> · </span>
          </>
        ) : null}

        {faixa ? (
          <>
            <strong className="acontecendo__titulo">{faixa.item.titulo}</strong>
            {faixa.item.local ? (
              <>
                <span className="acontecendo__sep"> · </span>
                <span className="acontecendo__local">{faixa.item.local}</span>
              </>
            ) : null}
          </>
        ) : (
          <span>A programação do encontro terminou.</span>
        )}
      </span>

      {faixa ? (
        <span className="acontecendo__tag" aria-hidden="true">
          {faixa.item.tag}
        </span>
      ) : null}

      {abrivel ? (
        <span className="acontecendo__mais" aria-hidden="true">
          +{outras}
        </span>
      ) : null}

      {abrivel ? (
        <>
          {/* Seta decorativa: o clique é da barra inteira, não só dela. */}
          <span className="acontecendo__seta" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>

          {/* Botão transparente cobrindo a faixa toda: qualquer ponto abre e
              fecha a lista. Fica no fluxo de camadas acima do texto e abaixo
              do painel, para o painel continuar clicável. */}
          <button
            className="acontecendo__acao"
            type="button"
            aria-expanded={aberto}
            aria-controls="acontecendo-outras"
            aria-label={
              aberto
                ? "Esconder outras atividades"
                : `Mostrar ${outras} outras atividades`
            }
            onClick={() => setAberto((valor) => !valor)}
          />

          {aberto ? (
            <div
              className="acontecendo__outras"
              id="acontecendo-outras"
              role="region"
              aria-label="Outras atividades acontecendo agora"
            >
              <p className="acontecendo__outras-titulo">
                Também acontecendo agora
              </p>
              <ul>
                {emCurso
                  .filter((f) => f !== faixa)
                  .map((f) => (
                    <li key={`${f.inicio}-${f.item.titulo}`}>
                      <span className="acontecendo__outras-hora">
                        {formatarHora(f.inicio)}
                      </span>
                      <strong>{f.item.titulo}</strong>
                      {f.item.local ? (
                        <span className="acontecendo__outras-local">
                          {f.item.local}
                        </span>
                      ) : null}
                      <span className="acontecendo__outras-tag">
                        {f.item.tag}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}

      <span className="acontecendo__leitura">{fraseDe(situacao)}</span>
    </div>
  );
}
