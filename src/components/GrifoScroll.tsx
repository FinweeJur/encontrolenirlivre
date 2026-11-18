/**
 * Grifo que "pinta" conforme a rolagem.
 *
 * Cada `<mark>` dentro do container ganha a variável `--grifo` (0% a 100%),
 * usada pelo CSS como largura do fundo. O progresso vem da posição do trecho
 * na tela: começa quando ele entra a 88% da altura da janela e completa a 42%.
 *
 * Por que JS e não `animation-timeline: view()`: o CSS scroll-driven ainda não
 * roda no Firefox e no Safari estáveis. Aqui funciona em qualquer navegador e
 * respeita `prefers-reduced-motion` (grifo já preenchido, sem animação).
 *
 * Por que sem requestAnimationFrame: em aba em segundo plano o rAF não corre e
 * o grifo ficava parado. O limite de 30 ms entre pinturas evita excesso.
 */
import { useEffect } from "react";
import type { RefObject } from "react";

const INTERVALO_MS = 30;

export function useGrifoScroll(container: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const raiz = container.current;
    if (!raiz) return;

    const marcas = Array.from(raiz.querySelectorAll<HTMLElement>("mark"));
    if (!marcas.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const marca of marcas) marca.style.setProperty("--grifo", "100%");
      return;
    }

    const pintar = () => {
      const altura = window.innerHeight;
      const inicio = altura * 0.88;
      const fim = altura * 0.42;

      marcas.forEach((marca, indice) => {
        const caixa = marca.getBoundingClientRect();
        if (caixa.bottom < 0 || caixa.top > altura) return;
        const bruto = Math.min(1, Math.max(0, (inicio - caixa.top) / (inicio - fim)));
        // Cada trecho começa um tico depois do anterior (3%): dá a sensação de
        // caneta passando de um grifo para o outro, sem atraso perceptível.
        const atraso = Math.min(0.18, indice * 0.03);
        const progresso = Math.min(1, Math.max(0, (bruto - atraso) / (1 - atraso)));
        marca.style.setProperty("--grifo", `${(progresso * 100).toFixed(1)}%`);
      });
    };

    let ultimo = 0;
    const agendar = () => {
      const agora = performance.now();
      if (agora - ultimo < INTERVALO_MS) return;
      ultimo = agora;
      pintar();
    };

    pintar();
    // Deep link (#carta-politica) chega já no meio da página, muitas vezes sem
    // evento de rolagem: pinta de novo depois que o layout assentar.
    const t1 = window.setTimeout(pintar, 350);
    const t2 = window.setTimeout(pintar, 1200);
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    window.addEventListener("hashchange", agendar);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      window.removeEventListener("hashchange", agendar);
    };
  }, [container]);
}
