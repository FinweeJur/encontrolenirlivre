import { galeria } from "../content/evento";
import InfiniteDrift2 from "./lightswind/infinite-drift-2";

/**
 * Faixa infinita de fotos: componente oficial Infinite Drift 2 (Lightswind).
 * Pausa sozinho fora da tela e respeita movimento reduzido pelo fallback estático.
 */
export function PhotoDrift({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className="band-dark drift-section" aria-labelledby="fotos-titulo">
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
            popular. Arraste as fotos para navegar.
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
      ) : (
        <InfiniteDrift2
          images={galeria}
          tileWidth={220}
          tileHeight={280}
          gap={14}
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
          dpr={Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 1.75)}
        />
      )}

      <p className="drift-credit shell">Fotos: acervo RENAP · edições anteriores</p>
    </section>
  );
}
