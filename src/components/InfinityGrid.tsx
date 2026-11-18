/**
 * Grade infinita de fotos — faixas horizontais que correm sem parar.
 *
 * Por que existe: a grade antiga usava canvas (Infinite Drift 2), repetia a
 * mesma foto para preencher a tela e, com a curva do componente, uma foto
 * caía em cima da outra. Aqui é CSS puro: cada faixa tem uma lista própria de
 * fotos, sem repetir dentro da faixa, e a emenda do laço é feita com duas
 * cópias da mesma lista (a segunda marcada como decorativa).
 *
 * Regras:
 * - faixas alternam o sentido, para a composição não parecer um tapete;
 * - a velocidade é constante em pixels por segundo, então faixa com mais
 *   fotos não fica mais rápida;
 * - `prefers-reduced-motion` desliga a animação e deixa a faixa rolável;
 * - nenhuma foto se repete dentro da mesma faixa.
 */
import "../styles/infinity-grid.css";

type Props = {
  imagens: string[];
  /** Quantas faixas empilhadas. */
  faixas?: number;
  /** Altura de cada foto, em pixels. */
  altura?: number;
  /** Pixels por segundo. */
  velocidade?: number;
  /** Texto alternativo base; o índice entra no fim. */
  alt?: string;
  /** Classe extra para casar com o tema da página. */
  className?: string;
};

function dividir(imagens: string[], quantas: number): string[][] {
  const faixas: string[][] = Array.from({ length: Math.max(1, quantas) }, () => []);
  imagens.forEach((imagem, indice) => {
    faixas[indice % faixas.length].push(imagem);
  });
  return faixas.filter((faixa) => faixa.length > 0);
}

export function InfinityGrid({
  imagens,
  faixas = 3,
  altura = 190,
  velocidade = 26,
  alt = "Foto do encontro",
  className = "",
}: Props) {
  if (!imagens.length) return null;

  const linhas = dividir(imagens, faixas);

  return (
    <div
      className={`infinito ${className}`}
      style={{ ["--infinito-altura" as string]: `${altura}px` }}
      role="group"
      aria-label="Fotos do encontro"
    >
      {linhas.map((linha, indiceLinha) => {
        const segundos = Math.max(18, Math.round(linha.length * (240 / velocidade)));
        return (
          <div
            key={indiceLinha}
            className="infinito__faixa"
            data-sentido={indiceLinha % 2 === 1 ? "volta" : "ida"}
            style={{ ["--infinito-tempo" as string]: `${segundos}s` }}
          >
            <div className="infinito__trilho">
              {[...linha, ...linha].map((src, indiceFoto) => (
                <img
                  key={`${src}-${indiceFoto}`}
                  src={src}
                  alt={indiceFoto < linha.length ? `${alt} ${indiceFoto + 1}` : ""}
                  aria-hidden={indiceFoto >= linha.length ? "true" : undefined}
                  loading="lazy"
                  decoding="async"
                  width={240}
                  height={altura}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
