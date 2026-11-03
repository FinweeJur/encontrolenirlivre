import { useEffect, useRef, useState } from "react";
import { Spark } from "../Motifs";

/**
 * Dois efeitos do Lightswind que não têm código público no registry
 * (layout-grid e scroll-star-effect respondem 401).
 * Foram refeitos aqui seguindo a descrição e os props da documentação:
 * - LayoutGrid: grade de fundo com deslocamento lento.
 * - ScrollStar: estrela que percorre a linha do tempo conforme o scroll.
 * Os demais efeitos (ElectroBorder, Lens, Infinite Drift 2) são os
 * componentes oficiais, em src/components/lightswind.
 */

/** Fundo de grade animada, usado na programação. */
export function LayoutGrid() {
  return <div className="layout-grid" aria-hidden="true" />;
}

/** Estrela que desce pela linha do tempo conforme o scroll. */
export function ScrollStar() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    // A estrela é filha absoluta da timeline: quem define o percurso é o pai.
    const track = el?.parentElement;
    if (!el || !track) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const percorrido = vh * 0.55 - r.top;
      const p = percorrido / Math.max(r.height, 1);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="scroll-star" aria-hidden="true">
      <span
        className="scroll-star__dot"
        style={{ top: `calc(${progress * 100}% - 12px)` }}
      >
        <Spark />
      </span>
    </div>
  );
}
