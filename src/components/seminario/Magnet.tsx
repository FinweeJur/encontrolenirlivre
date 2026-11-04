"use client";

/**
 * Magnet — ímã leve para botões e cartões.
 *
 * Referência: o `Magnet` do React Bits (usado no portal do Controle Popular).
 * Aqui é uma versão curta e sem dependência: o elemento se desloca alguns
 * pixels na direção do ponteiro e volta com mola quando ele sai. O
 * deslocamento máximo é pequeno de propósito — é hierarquia de botão, não
 * efeito de circo.
 */

import { useRef, type ReactNode } from "react";

export function Magnet({
  children,
  forca = 0.18,
  limite = 8,
  className = "",
}: {
  children: ReactNode;
  /** Fração da distância do ponteiro que o elemento acompanha. */
  forca?: number;
  /** Deslocamento máximo, em px. */
  limite?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  function mover(ev: React.PointerEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (ev.clientX - (r.left + r.width / 2)) * forca;
    const dy = (ev.clientY - (r.top + r.height / 2)) * forca;
    el.style.transform = `translate(${Math.max(-limite, Math.min(limite, dx))}px, ${Math.max(
      -limite,
      Math.min(limite, dy),
    )}px)`;
  }

  function soltar() {
    const el = ref.current;
    if (el) el.style.transform = "";
  }

  return (
    <span
      ref={ref}
      className={`magnet ${className}`.trim()}
      onPointerMove={mover}
      onPointerLeave={soltar}
      onPointerCancel={soltar}
    >
      {children}
    </span>
  );
}
