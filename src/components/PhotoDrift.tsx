/**
 * Faixa infinita de fotos do acervo (edições anteriores).
 *
 * Antes usava o canvas Infinite Drift 2: ele repetia a mesma foto para
 * preencher a tela e, com a curva do componente, uma foto caía em cima da
 * outra. Agora é `InfinityGrid` — CSS puro, cada faixa com fotos próprias,
 * sem repetição dentro da faixa. O texto e o crédito continuam os mesmos.
 */
import { galeria } from "../content/evento";
import { InfinityGrid } from "./InfinityGrid";

export function PhotoDrift({ reducedMotion }: { reducedMotion: boolean }) {
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
            popular. As fotos correm sozinhas; pare o mouse para olhar com calma.
          </p>
        </div>
      </div>

      <InfinityGrid
        imagens={galeria}
        faixas={3}
        altura={240}
        velocidade={reducedMotion ? 0 : 22}
        alt="Encontro da RENAP"
      />

      <p className="drift-credit shell">Fotos: acervo RENAP · edições anteriores</p>
    </section>
  );
}
