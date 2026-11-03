"use client";

/**
 * CursorEletrico — anel de corrente elétrica pequeno que segue o ponteiro.
 *
 * Por que existe: o efeito "elétrico" do encontro (Electric Logo, Electro
 * Border) mora nos elementos; faltava o ponteiro. Este é o mesmo vocabulário
 * gráfico em escala mínima: um anel de ~26 px com arcos que estalam, na cor do
 * tema — vermelho no escuro, vermelho profundo no kraft.
 *
 * Escolhas técnicas:
 * - desenho em canvas 2D, 1 único elemento: nenhum nó por quadro;
 * - o anel é desenhado só depois do primeiro movimento e desliga sozinho
 *   quando o ponteiro para (economiza bateria);
 * - some em `pointer: coarse` (celular/tablet) e com `prefers-reduced-motion`,
 *   onde o cursor do sistema já resolve;
 * - tamanho fixo e pequeno (diâmetro 26 px), independente do cursor do
 *   sistema — é decoração, não substitui o ponteiro.
 */

import { useEffect, useRef } from "react";

/** Diâmetro do anel, em px de CSS. */
const DIAMETRO = 26;
/** Raio base do anel. */
const RAIO = DIAMETRO / 2 - 2;
/** Parado por este tempo, o anel apaga. */
const OCIOSO_MS = 900;

export function CursorEletrico() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const lado = Math.round(DIAMETRO * dpr);
    canvas.width = lado;
    canvas.height = lado;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const lerCor = () => {
      const s = getComputedStyle(document.documentElement).getPropertyValue("--red");
      return s.trim() || "#d63b32";
    };
    let cor = lerCor();

    let x = -100;
    let y = -100;
    let ultimoMovimento = 0;
    let desenhando = false;
    let quadro = 0;

    const esconder = () => {
      canvas.style.opacity = "0";
      desenhando = false;
    };

    /** Um arco irregular: o raio oscila e o traço estala. */
    const arco = (inicio: number, fim: number, raio: number, espessura: number, alpha: number) => {
      ctx.beginPath();
      const passo = 0.16;
      for (let a = inicio; a <= fim; a += passo) {
        const r = raio + (Math.random() - 0.5) * 2.4;
        const px = DIAMETRO / 2 + Math.cos(a) * r;
        const py = DIAMETRO / 2 + Math.sin(a) * r;
        if (a === inicio) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = cor;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = espessura;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    const quadroAtual = () => {
      ctx.clearRect(0, 0, DIAMETRO, DIAMETRO);

      // Anel principal, quebrado em três trechos para parecer corrente.
      arco(-1.15, 0.55, RAIO, 1.15, 0.95);
      arco(0.75, 1.75, RAIO + 0.6, 0.85, 0.6);
      arco(2.05, 3.55, RAIO, 1.15, 0.95);
      arco(3.75, 4.75, RAIO + 0.6, 0.85, 0.55);

      // Dois estalos curtos, fora do anel, trocando de lado a cada quadro.
      if (Math.random() < 0.55) {
        const a = Math.random() * Math.PI * 2;
        const r0 = RAIO + 1.5;
        const r1 = RAIO + 3 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(DIAMETRO / 2 + Math.cos(a) * r0, DIAMETRO / 2 + Math.sin(a) * r0);
        ctx.lineTo(DIAMETRO / 2 + Math.cos(a) * r1, DIAMETRO / 2 + Math.sin(a) * r1);
        ctx.strokeStyle = cor;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      if (performance.now() - ultimoMovimento > OCIOSO_MS) {
        esconder();
        return;
      }
      quadro = requestAnimationFrame(quadroAtual);
    };

    const acordar = () => {
      if (!desenhando) {
        desenhando = true;
        canvas.style.opacity = "1";
      }
      if (!quadro) quadro = requestAnimationFrame(quadroAtual);
    };

    const aoMover = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX;
      y = e.clientY;
      ultimoMovimento = performance.now();
      canvas.style.transform = `translate3d(${x - DIAMETRO / 2}px, ${y - DIAMETRO / 2}px, 0)`;
      acordar();
    };

    const aoTrocarTema = () => {
      cor = lerCor();
    };

    window.addEventListener("pointermove", aoMover, { passive: true });
    window.addEventListener("click", aoTrocarTema);

    return () => {
      window.removeEventListener("pointermove", aoMover);
      window.removeEventListener("click", aoTrocarTema);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-eletrico"
      aria-hidden="true"
      style={{ width: DIAMETRO, height: DIAMETRO }}
    />
  );
}
