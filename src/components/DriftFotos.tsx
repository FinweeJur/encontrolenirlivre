/**
 * Faixa de fotos com o Infinite Drift 2: grade em domo que corre sozinha,
 * arrastável com o mouse/dedo e com lente de aumento sobre o ponteiro.
 *
 * Por que a lente é feita aqui e não com um componente de DOM: o Infinite
 * Drift 2 desenha em WebGL. Clonar o DOM com CSS (o que a lente de vitrine
 * faz) copia o canvas, não o conteúdo dele — daí a "lente desconectada", com
 * metade de uma foto e metade de outra. Aqui a lente é um segundo canvas que
 * copia, a cada quadro, a região exata que está atrás do ponteiro:
 *
 *   lado da fonte = LENTE / ZOOM        (região em px de CSS)
 *   origem       = ponteiro - lado/2   (limitada às bordas do canvas)
 *   destino      = canvas da lente inteiro
 *
 * Ajustes que evitam o defeito antigo (foto repetida e uma em cima da outra):
 * o atlas do componente cresce com a lista (até 9×9), a textura sobe para
 * 2048 px e as células são preenchidas em ciclo — nenhuma fica preta.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteDrift2 from "./lightswind/infinite-drift-2";

const LENTE = 210;
const ZOOM = 1.7;

type Props = {
  imagens: string[];
  altura?: string;
  /** Curva do domo. Acima de 0.3 começa a encostar ladrilho com ladrilho. */
  curva?: number;
  /** Lado do ladrilho, em pixels. */
  ladrilho?: number;
  /** Mostra a lente de aumento no ponteiro (telas largas e mouse). */
  lente?: boolean;
  fundo?: string;
};

export function DriftFotos({
  imagens,
  altura = "clamp(26rem, 58vw, 44rem)",
  curva = 0.16,
  ladrilho = 250,
  lente = true,
  fundo = "#100e0a",
}: Props) {
  const caixaRef = useRef<HTMLDivElement>(null);
  const lenteRef = useRef<HTMLCanvasElement>(null);
  const pontoRef = useRef<{ x: number; y: number } | null>(null);
  const [comLente, setComLente] = useState(false);
  const [posicao, setPosicao] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!lente) return;
    const mq = window.matchMedia("(min-width: 1100px) and (hover: hover) and (pointer: fine)");
    const sync = () => setComLente(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [lente]);

  /** Copia para o canvas da lente a região que está sob o ponteiro. */
  const desenharLente = useCallback(() => {
    const caixa = caixaRef.current;
    const destino = lenteRef.current;
    const ponto = pontoRef.current;
    if (!caixa || !destino || !ponto) return;

    const fonte = caixa.querySelector("canvas");
    if (!fonte) return;

    const contexto = destino.getContext("2d");
    if (!contexto) return;

    const tamanhoCss = fonte.getBoundingClientRect().width || 1;
    const escala = fonte.width / tamanhoCss; // device pixel ratio aplicado no canvas
    const ladoFonte = LENTE / ZOOM;

    // Região em volta do ponteiro, presa dentro do canvas.
    const origemX = Math.min(
      Math.max(0, (ponto.x - ladoFonte / 2) * escala),
      Math.max(0, fonte.width - ladoFonte * escala),
    );
    const origemY = Math.min(
      Math.max(0, (ponto.y - ladoFonte / 2) * escala),
      Math.max(0, fonte.height - ladoFonte * escala),
    );

    contexto.clearRect(0, 0, destino.width, destino.height);
    contexto.drawImage(
      fonte,
      origemX,
      origemY,
      ladoFonte * escala,
      ladoFonte * escala,
      0,
      0,
      destino.width,
      destino.height,
    );
  }, []);

  // Enquanto a lente está visível, redesenha a cada quadro: a grade se move.
  // A dependência é o "está visível", não a posição: se dependesse do objeto,
  // o laço reiniciaria a cada movimento do ponteiro.
  const visivel = posicao !== null;
  useEffect(() => {
    if (!visivel) return;
    let vivo = true;
    let quadro = 0;

    const laco = () => {
      if (!vivo) return;
      desenharLente();
      quadro = window.requestAnimationFrame(laco);
    };
    quadro = window.requestAnimationFrame(laco);

    return () => {
      vivo = false;
      window.cancelAnimationFrame(quadro);
    };
  }, [visivel, desenharLente]);

  // Desenha assim que a posição muda: não depende do laço nem do rAF, que o
  // navegador pode segurar em aba em segundo plano.
  useEffect(() => {
    if (!posicao) return;
    desenharLente();
  }, [posicao, desenharLente]);

  const grade = (
    <InfiniteDrift2
      images={imagens}
      tileWidth={ladrilho}
      // 4:3, igual ao corte das fotos: sem isso a imagem estica na vertical,
      // porque o shader amostra o ladrilho inteiro de uma célula quadrada.
      tileHeight={Math.round(ladrilho * 0.75)}
      gap={14}
      borderRadius={5}
      curve={curva}
      curveRadius={2.1}
      zoom={0.04}
      grayscale={0.1}
      vignette={0.2}
      autoScrollX={0.3}
      autoScrollY={0.08}
      backgroundColor={fundo}
      height={altura}
      // A roda do mouse fica com a PÁGINA: sem isso, descer o site trava a
      // grade e o visitante acha que a página congelou. O arrasto continua.
      enableWheel={false}
      enableDrag
      dragSensitivity={1.1}
      friction={0.93}
      dpr={Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 1.75)}
    />
  );

  if (!comLente) return grade;

  return (
    <div
      className="drift-lente"
      ref={caixaRef}
      onPointerMove={(evento) => {
        const caixa = evento.currentTarget.getBoundingClientRect();
        const ponto = { x: evento.clientX - caixa.left, y: evento.clientY - caixa.top };
        pontoRef.current = ponto;
        setPosicao(ponto);
        // Pinta no mesmo quadro (sem esperar o rAF) e no quadro seguinte,
        // quando o canvas da lente já existe na primeira passada.
        desenharLente();
        window.requestAnimationFrame(desenharLente);
      }}
      onPointerLeave={() => {
        pontoRef.current = null;
        setPosicao(null);
      }}
    >
      {grade}
      {posicao ? (
        <div
          className="drift-lente__aro"
          aria-hidden="true"
          style={{
            left: posicao.x - LENTE / 2,
            top: posicao.y - LENTE / 2,
            width: LENTE,
            height: LENTE,
          }}
        >
          <canvas
            ref={lenteRef}
            className="drift-lente__tela"
            width={Math.round(LENTE * 2)}
            height={Math.round(LENTE * 2)}
          />
        </div>
      ) : null}
    </div>
  );
}
