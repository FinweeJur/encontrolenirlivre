/**
 * Faixa de fotos com o Infinite Drift 2: grade em domo que corre sozinha,
 * arrastável com o mouse/dedo e com lente de aumento sobre o ponteiro.
 *
 * Por que um componente só: o encontro usa duas instâncias (fotos antigas e
 * fotos novas) e o seminário usa a mesma coisa. Assim o comportamento (arrasto,
 * lente, pausa fora da tela e movimento reduzido) é idêntico nos três lugares.
 *
 * Ajustes que evitam o defeito antigo (foto repetida e uma em cima da outra):
 * - o atlas do componente cresce com a lista (até 9×9) e o shader descarta as
 *   células sem foto — nada de repetir imagem para preencher;
 * - a curva fica suave (0.16), o que mantém o efeito de domo sem comprimir os
 *   ladrilhos a ponto de encostarem.
 */
import { useEffect, useState } from "react";
import InfiniteDrift2 from "./lightswind/infinite-drift-2";
import { Lens } from "./lightswind/lens";

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
  ladrilho = 210,
  lente = true,
  fundo = "#100e0a",
}: Props) {
  const [comLente, setComLente] = useState(false);
  const [anel, setAnel] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!lente) return;
    const mq = window.matchMedia("(min-width: 1100px) and (hover: hover) and (pointer: fine)");
    const sync = () => setComLente(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [lente]);

  const grade = (
    <InfiniteDrift2
      images={imagens}
      tileWidth={ladrilho}
      tileHeight={Math.round(ladrilho * 1.25)}
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
      className="drift-lens"
      onPointerMove={(evento) => {
        const caixa = evento.currentTarget.getBoundingClientRect();
        setAnel({ x: evento.clientX - caixa.left, y: evento.clientY - caixa.top });
      }}
      onPointerLeave={() => setAnel(null)}
    >
      <Lens
        zoomFactor={1.5}
        lensSize={210}
        borderRadius="md"
        borderWidth={1}
        borderColor="border-white/40"
        shadowIntensity="heavy"
        animationDuration={0.24}
        blurEdge={false}
      >
        {grade}
      </Lens>
      {anel && (
        <span
          className="encounter__anel drift-anel"
          aria-hidden="true"
          style={{ left: anel.x, top: anel.y, width: 210, height: 210 }}
        />
      )}
    </div>
  );
}
