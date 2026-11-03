"use client";

/**
 * Player de rádio — CÓPIA ADAPTADA de
 * `controle-popular/apps/web/app/components/PlayerRadio.tsx`.
 *
 * O que veio do portal, igual: o desenho do botão redondo (Radio → Pause →
 * Play), o índice que abre no hover/foco com a lista agrupada por tipo, o
 * tooltip de descrição que abre depois de 1 s de mouse, o volume com mudo, o
 * evento global `cp:radio-tocar`/`cp:radio-estado` e o carregamento de HLS sob
 * demanda (hls.js, importado só quando a estação é HLS).
 *
 * O que mudou, e por quê:
 * - `next/link` → `<a>` comum levando à página /radio do portal (aqui não há
 *   roteador nem essa página).
 * - Bandagens do portal (Bandeira, LogoRadio, SloshGauge, TranscricaoRadio,
 *   useArrastavel, usePosicionarPainel) saíram: são peças do layout do
 *   controlepopular.com.br. A bandeira/UF virou texto da região, o medidor de
 *   líquido virou `<input type="range">` e o arrasto saiu — aqui o player é
 *   ferramenta da página, não parte da pilha flutuante do portal.
 * - As classes utilitárias são as mesmas do original; as cores `primary`,
 *   `surface`, `surface-2`, `border`, `text` e `text-soft` foram mapeadas para
 *   os tokens do encontro em `tailwind.config.js`.
 *
 * Funciona em site estático (Cloudflare Pages): o áudio é tocado pelo próprio
 * navegador a partir do stream público de cada emissora, sem servidor nosso.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ListMusic, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import {
  ESTACOES_ORDENADAS,
  estacaoPorId,
  ORDEM_TIPOS,
  ROTULO_REGIAO,
  ROTULO_TIPO,
  type EstacaoRadio,
} from "../../lib/radio/estacoes";
import { EVENTO_ESTADO, EVENTO_TOCAR, type EstadoRadio } from "../../lib/radio/eventos";

/** Estação acionada quando nada está carregado. */
const ESTACAO_PADRAO = "radio-brasil-de-fato";

/** Evento que abre/fecha o painel de estações (chamado pelo speed dial). */
export const EVENTO_RADIO = "ecnl:radio-abrir";

export function pedirRadio() {
  window.dispatchEvent(new Event(EVENTO_RADIO));
}

export function PlayerRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [idAtual, setIdAtual] = useState<string | null>(null);
  const [tocando, setTocando] = useState(false);
  const [jaTocou, setJaTocou] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [indiceAberto, setIndiceAberto] = useState(false);
  const [volume, setVolume] = useState(1);
  const [mudo, setMudo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // Tooltip de descrição: uma por vez, 1 s de mouse (regra do portal).
  const [tooltipAberto, setTooltipAberto] = useState<string | null>(null);
  const tooltipTimer = useRef<number | null>(null);
  const limparTooltipTimer = useCallback(() => {
    if (tooltipTimer.current !== null) {
      window.clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => limparTooltipTimer();
  }, [limparTooltipTimer]);

  // Espelha volume/mudo no <audio>.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = mudo;
  }, [volume, mudo]);

  // Painel de estações: abre pelo speed dial (evento global), fecha no X, no
  // Esc ou ao clicar fora. Não há mais botão flutuante próprio — quem chama é
  // a bandeja de ferramentas.
  const fecharIndiceJa = useCallback(() => setIndiceAberto(false), []);
  useEffect(() => {
    const aoPedir = () => setIndiceAberto((a) => !a);
    window.addEventListener(EVENTO_RADIO, aoPedir);
    return () => window.removeEventListener(EVENTO_RADIO, aoPedir);
  }, []);

  useEffect(() => {
    if (!indiceAberto) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setIndiceAberto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [indiceAberto]);

  /** Publica o estado para outros componentes. */
  useEffect(() => {
    const estado: EstadoRadio = { id: idAtual, tocando, carregando };
    window.dispatchEvent(new CustomEvent(EVENTO_ESTADO, { detail: estado }));
  }, [idAtual, tocando, carregando]);

  /** Carrega e toca uma estação. */
  const carregar = useCallback(async (estacao: EstacaoRadio) => {
    const audio = audioRef.current;
    if (!audio) return;
    setCarregando(true);
    setAviso(null);
    setIdAtual(estacao.id);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    audio.pause();

    const suporteHlsNativo = audio.canPlayType("application/vnd.apple.mpegurl") !== "";

    if (estacao.formato === "hls" && !suporteHlsNativo) {
      try {
        const { default: Hls } = await import("hls.js");
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: false });
          hlsRef.current = hls;
          hls.on(Hls.Events.ERROR, (_evt: unknown, data: { fatal?: boolean }) => {
            if (data?.fatal) {
              setCarregando(false);
              setTocando(false);
              setAviso("Esta emissora não respondeu. Tente outra.");
            }
          });
          hls.loadSource(estacao.stream);
          hls.attachMedia(audio);
        } else {
          audio.src = estacao.stream;
        }
      } catch {
        setCarregando(false);
        setAviso("O navegador não conseguiu carregar esta emissora.");
        return;
      }
    } else {
      audio.src = estacao.stream;
    }

    audio.load();
    try {
      await audio.play();
    } catch {
      setCarregando(false);
      setAviso("O navegador bloqueou o áudio. Toque no play de novo.");
    }
  }, []);

  /** Toca/pausa a estação indicada (ou troca, se for outra). */
  const tocar = useCallback(
    async (id: string) => {
      const estacao = estacaoPorId(id);
      const audio = audioRef.current;
      if (!estacao || !audio) return;

      if (idAtual === id) {
        if (audio.paused) {
          setCarregando(true);
          try {
            await audio.play();
          } catch {
            setCarregando(false);
          }
        } else {
          audio.pause();
        }
        return;
      }
      await carregar(estacao);
    },
    [idAtual, carregar],
  );

  // Ouvintes externos (evento global do portal).
  useEffect(() => {
    const aoTocar = (ev: Event) => {
      const d = (ev as CustomEvent<{ id?: string }>).detail;
      if (d?.id) void tocar(d.id);
    };
    window.addEventListener(EVENTO_TOCAR, aoTocar);
    return () => window.removeEventListener(EVENTO_TOCAR, aoTocar);
  }, [tocar]);

  useEffect(() => {
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, []);

  const estacaoAtual = idAtual ? estacaoPorId(idAtual) ?? null : null;
  const rotulo = tocando
    ? `Pausar ${estacaoAtual?.nome ?? "a rádio"}`
    : `Ouvir ${estacaoAtual?.nome ?? "a rádio"}`;

  return (
    <div className="radio-caixa">
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => {
          setTocando(true);
          setJaTocou(true);
          setCarregando(false);
        }}
        onPause={() => setTocando(false)}
        onWaiting={() => setCarregando(true)}
        onPlaying={() => setCarregando(false)}
        onError={() => {
          setTocando(false);
          setCarregando(false);
        }}
      />

      {indiceAberto && (
        <div
          id="ecnl-radio-indice"
          className="radio-painel flex w-[min(calc(100vw-2rem),21rem)] flex-row overflow-hidden rounded-2xl border border-border shadow-2xl"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-primary/10 px-3 py-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-text">
                <ListMusic size={14} aria-hidden="true" />
                Rádios
              </p>
              <button
                type="button"
                onClick={() => void tocar(idAtual ?? ESTACAO_PADRAO)}
                aria-label={rotulo}
                aria-pressed={tocando}
                title={rotulo}
                className="cursor-pointer rounded-full p-0.5 text-primary hover:text-text"
              >
                {tocando ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
              </button>
              <a
                href="https://www.controlepopular.com.br/radio"
                target="_blank"
                rel="noopener noreferrer"
                onClick={fecharIndiceJa}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Diretório completo ↗
              </a>
              <button
                type="button"
                onClick={fecharIndiceJa}
                aria-label="Fechar o índice de rádios"
                className="cursor-pointer rounded-full p-0.5 text-text-soft hover:bg-surface-2 hover:text-primary"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-64 min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              {ORDEM_TIPOS.map((tipo) => {
                const grupo = ESTACOES_ORDENADAS.filter((e) => e.tipo === tipo);
                if (grupo.length === 0) return null;
                return (
                  <div key={tipo} className="mb-1.5 last:mb-0">
                    <p className="px-1 py-1 text-[0.75rem] font-bold uppercase tracking-wide text-text-soft">
                      {ROTULO_TIPO[tipo]}
                    </p>
                    <ul>
                      {grupo.map((e) => {
                        const ativa = e.id === idAtual;
                        const tooltipDeste = tooltipAberto === e.id;
                        return (
                          <li key={e.id} className="relative">
                            {tooltipDeste && (
                              <span
                                id={`ecnl-dica-${e.id}`}
                                role="tooltip"
                                className="pointer-events-none absolute bottom-full left-0 z-10 mb-1.5 block w-52 rounded-lg border border-border bg-surface px-2 py-1.5 text-[0.7rem] leading-snug text-text shadow-lg"
                              >
                                {e.descricao}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => void tocar(e.id)}
                              onMouseEnter={() => {
                                limparTooltipTimer();
                                tooltipTimer.current = window.setTimeout(() => {
                                  tooltipTimer.current = null;
                                  setTooltipAberto(e.id);
                                }, 1000);
                              }}
                              onMouseLeave={() => {
                                limparTooltipTimer();
                                setTooltipAberto(null);
                              }}
                              onFocus={() => {
                                limparTooltipTimer();
                                setTooltipAberto(e.id);
                              }}
                              onBlur={() => {
                                limparTooltipTimer();
                                setTooltipAberto(null);
                              }}
                              aria-describedby={tooltipDeste ? `ecnl-dica-${e.id}` : undefined}
                              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-surface-2 ${
                                ativa ? "bg-primary/10" : ""
                              }`}
                            >
                              <span className="min-w-0 flex-1 truncate text-xs text-text">
                                {e.nome}
                              </span>
                              <span className="shrink-0 text-[0.75rem] text-text-soft">
                                {ROTULO_REGIAO[e.regiao]}
                              </span>
                              {ativa && carregando ? (
                                <span className="shrink-0 text-[0.75rem] font-medium text-primary">
                                  Sintonizando…
                                </span>
                              ) : ativa && tocando ? (
                                <Pause size={12} className="shrink-0 text-primary" aria-hidden="true" />
                              ) : (
                                <Play size={12} className="shrink-0 text-text-soft" aria-hidden="true" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            {aviso && (
              <p className="border-t border-border px-3 py-2 text-[0.7rem] text-text-soft">{aviso}</p>
            )}

            {/* Rodapé: volume e atalho para o diretório completo do portal.
                No portal este controle é a coluna do medidor de líquido; aqui
                vira uma linha, que lê melhor em tela pequena. */}
            <div className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-2">
              <button
                type="button"
                onClick={() => setMudo((m) => !m)}
                aria-label={mudo ? "Ativar som da rádio" : "Silenciar rádio"}
                aria-pressed={mudo}
                className="shrink-0 cursor-pointer text-text-soft transition-colors hover:text-primary"
              >
                {mudo || volume === 0 ? (
                  <VolumeX size={16} aria-hidden="true" />
                ) : (
                  <Volume2 size={16} aria-hidden="true" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={mudo ? 0 : Math.round(volume * 100)}
                onChange={(ev) => {
                  const n = Number(ev.target.value);
                  setVolume(n / 100);
                  if (n > 0) setMudo(false);
                }}
                aria-label="Volume da rádio"
                className="ecnl-volume"
              />
              <span aria-hidden="true" className="w-8 shrink-0 text-right text-[0.7rem] tabular-nums text-text-soft">
                {mudo || volume === 0 ? "mudo" : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
