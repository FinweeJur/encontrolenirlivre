import { useEffect, useState } from "react";
import { galeria } from "../content/evento";
import InfiniteDrift2 from "./lightswind/infinite-drift-2";
import { Lens } from "./lightswind/lens";

/**
 * Faixa infinita de fotos: componente oficial Infinite Drift 2 (Lightswind).
 * Pausa sozinho fora da tela e respeita movimento reduzido pelo fallback
 * estático.
 *
 * Lente sobre a grade: em tela larga, com ponteiro fino, a grade entra dentro
 * do componente oficial Lens (Lightswind) — o mesmo do banner. São duas
 * instâncias da grade (a de baixo e a ampliada dentro da lente), então a lente
 * só existe onde há fôlego de GPU; no celular e no toque fica a grade pura.
 */
export function PhotoDrift({ reducedMotion }: { reducedMotion: boolean }) {
  const [lenteAtiva, setLenteAtiva] = useState(false);
  const [anel, setAnel] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1100px) and (hover: hover) and (pointer: fine)");
    const sync = () => setLenteAtiva(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const grade = (
    <InfiniteDrift2
      images={galeria}
      tileWidth={200}
      tileHeight={255}
      gap={12}
      borderRadius={4}
      curve={0.28}
      curveRadius={1.7}
      zoom={0.06}
      grayscale={0.12}
      vignette={0.22}
      autoScrollX={0.32}
      autoScrollY={0.1}
      backgroundColor="#100e0a"
      height="clamp(30rem, 70vw, 56rem)"
      // A roda do mouse fica com a PÁGINA: o componente, por padrão, chama
      // preventDefault no wheel para deslizar a grade e prende o scroll de
      // quem está descendo o site. O arrasto com o ponteiro continua.
      enableWheel={false}
      dpr={Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 1.75)}
    />
  );

  return (
    <section className="band-dark drift-section" id="fotos" aria-labelledby="fotos-titulo">
      <div className="shell drift-head">
        <div>
          <p className="section-tag">A rede em movimento</p>
          <h2 id="fotos-titulo" className="drift-title">
            Rostos que<br />
            <span className="red">fazem a luta</span>
          </h2>
        </div>
        <div className="drift-side">
          <p>
            Encontros estaduais, plenárias, atos e a mística da advocacia
            popular. Arraste as fotos para navegar e passe o mouse para ampliar.
          </p>
        </div>
      </div>

      {reducedMotion ? (
        <div className="drift-fallback shell">
          {galeria.slice(0, 6).map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Encontro da RENAP ${i + 1}`}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      ) : lenteAtiva ? (
        <div
          className="drift-lens"
          onPointerMove={(ev) => {
            const r = ev.currentTarget.getBoundingClientRect();
            setAnel({ x: ev.clientX - r.left, y: ev.clientY - r.top });
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
      ) : (
        grade
      )}

      <p className="drift-credit shell">Fotos: acervo RENAP · edições anteriores</p>
    </section>
  );
}
