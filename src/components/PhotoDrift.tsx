/**
 * Faixa de fotos antigas — edições anteriores do encontro.
 *
 * Usa o Infinite Drift 2 (grade em domo, arrastável, com lente de aumento).
 * As fotos novas do XXX Encontro têm seção própria, com outra instância do
 * mesmo componente.
 */
import { galeria } from "../content/evento";
import { DriftFotos } from "./DriftFotos";

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
            popular. Arraste com o mouse e passe o ponteiro para ampliar.
          </p>
        </div>
      </div>

      <DriftFotos
        imagens={galeria}
        curva={reducedMotion ? 0.06 : 0.16}
        altura="clamp(26rem, 58vw, 44rem)"
      />

      <p className="drift-credit shell">Fotos: acervo RENAP · edições anteriores</p>
    </section>
  );
}
