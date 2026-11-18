/**
 * Grifo que "pinta" conforme a rolagem.
 *
 * O texto destacado é dividido em palavras. Cada palavra recebe duas variáveis:
 * `--g` (largura do amarelo, 0-100%) e `--gn` (0-100, para a cor da letra). A
 * palavra só começa a ser pintada quando a "caneta" chega nela, e a posição da
 * caneta vem da rolagem: o trecho entra a 88% da altura da janela e termina a
 * 42%. A ordem das palavras segue a posição horizontal delas no trecho, então
 * o amarelo atravessa a linha da esquerda para a direita.
 *
 * Por que JS e não `animation-timeline: view()`: o CSS scroll-driven ainda não
 * roda no Firefox e no Safari estáveis. Aqui funciona em qualquer navegador e
 * respeita `prefers-reduced-motion` (tudo já pintado, sem animação).
 *
 * Por que sem requestAnimationFrame: em aba em segundo plano o rAF não corre e
 * o grifo ficava parado. O limite de 30 ms entre pinturas evita excesso.
 */
import { useEffect } from "react";
import type { RefObject } from "react";

const INTERVALO_MS = 30;
/** Quanto do trecho a caneta cobre por vez (0,16 = ponta curta). */
const PONTA = 0.16;

type Palavra = {
  elemento: HTMLElement;
  /** Posição horizontal da palavra dentro do trecho, de 0 a 1. */
  posicao: number;
};

export function useGrifoScroll(container: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const raiz = container.current;
    if (!raiz) return;

    const marcas = Array.from(raiz.querySelectorAll<HTMLElement>("mark.grifo"));
    if (!marcas.length) return;

    const pintarTudo = () => {
      for (const marca of marcas) {
        for (const palavra of marca.querySelectorAll<HTMLElement>(".grifo__p")) {
          palavra.style.setProperty("--g", "100%");
          palavra.style.setProperty("--gn", "100");
        }
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pintarTudo();
      return;
    }

    // Cache das posições: ler offsetLeft a cada quadro provoca recálculo de
    // layout. Recalcula só no início e no resize.
    let grupos: { marca: HTMLElement; palavras: Palavra[] }[] = [];

    const medir = () => {
      grupos = marcas.map((marca) => {
        const elementos = Array.from(marca.querySelectorAll<HTMLElement>(".grifo__p"));
        const total = Math.max(1, elementos.length - 1);
        // Posição pela ordem de leitura, não pelo x: assim a caneta atravessa
        // a linha e continua na de baixo em ordem, sem voltar para a esquerda.
        const palavras = elementos.map((elemento, indice) => ({
          elemento,
          posicao: indice / total,
        }));
        return { marca, palavras };
      });
    };

    const pintar = () => {
      const altura = window.innerHeight;
      const inicio = altura * 0.88;
      const fim = altura * 0.42;

      for (const { marca, palavras } of grupos) {
        const caixa = marca.getBoundingClientRect();
        if (caixa.bottom < 0 || caixa.top > altura) continue;

        const progresso = Math.min(1, Math.max(0, (inicio - caixa.top) / (inicio - fim)));

        for (const { elemento, posicao } of palavras) {
          const local = Math.min(
            1,
            Math.max(0, (progresso - posicao * (1 - PONTA)) / PONTA),
          );
          const atual = elemento.style.getPropertyValue("--g");
          const novo = `${(local * 100).toFixed(0)}%`;
          if (atual !== novo) {
            elemento.style.setProperty("--g", novo);
            elemento.style.setProperty("--gn", (local * 100).toFixed(0));
          }
        }
      }
    };

    medir();
    pintar();

    let ultimo = 0;
    const agendar = () => {
      const agora = performance.now();
      if (agora - ultimo < INTERVALO_MS) return;
      ultimo = agora;
      pintar();
    };

    const remedir = () => {
      medir();
      pintar();
    };

    // Deep link (#carta-politica) chega já no meio da página, muitas vezes sem
    // evento de rolagem: pinta de novo depois que o layout assentar.
    const t1 = window.setTimeout(remedir, 350);
    const t2 = window.setTimeout(remedir, 1200);
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", remedir);
    window.addEventListener("hashchange", remedir);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", remedir);
      window.removeEventListener("hashchange", remedir);
    };
  }, [container]);
}
