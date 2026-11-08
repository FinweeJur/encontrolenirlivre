/**
 * Trabalhos acadêmicos aprovados — bloco recolhido dentro da programação.
 *
 * A página da RENAP não precisa abrir com 140 títulos na cara do leitor. O
 * bloco fica fechado, com o número e a frase de contexto, e abre em acordeão
 * por grupo de discussão. Os dados são os mesmos do site do seminário
 * (`content/gdSessoes.ts`), então corrigir num lugar corrige nos dois.
 */
import { gdSessoes, eixosGd } from "../content/gdSessoes";
import "../styles/trabalhos.css";

type Grupo = {
  numero: number;
  titulo: string;
  eixo: string;
  trabalhos: string[];
};

function agrupar(): Grupo[] {
  const mapa = new Map<number, Grupo>();

  for (const sessao of gdSessoes) {
    const atual = mapa.get(sessao.gd);
    if (atual) {
      atual.trabalhos.push(...sessao.trabalhos);
      continue;
    }
    mapa.set(sessao.gd, {
      numero: sessao.gd,
      titulo: sessao.titulo,
      eixo: eixosGd[sessao.gd] ?? "Grupo de discussão",
      trabalhos: [...sessao.trabalhos],
    });
  }

  return [...mapa.values()].sort((a, b) => a.numero - b.numero);
}

export function TrabalhosAcademicos() {
  const grupos = agrupar();
  const total = grupos.reduce((soma, g) => soma + g.trabalhos.length, 0);

  return (
    <details className="trabalhos" id="trabalhos">
      <summary>
        <span className="trabalhos__rotulo">Trabalhos acadêmicos</span>
        <span className="trabalhos__resumo">
          <strong>{total}</strong> trabalhos aprovados em{" "}
          <strong>{grupos.length}</strong> GDs
        </span>
        <span className="trabalhos__abre" aria-hidden="true">
          ver a lista ↓
        </span>
      </summary>

      <div className="trabalhos__corpo">
        {grupos.map((g) => (
          <details className="trabalhos__gd" key={g.numero}>
            <summary>
              <span className="trabalhos__num">
                {String(g.numero).padStart(2, "0")}
              </span>
              <span className="trabalhos__titulo">{g.titulo}</span>
              <span className="trabalhos__conta">{g.trabalhos.length}</span>
            </summary>

            <p className="trabalhos__eixo">{g.eixo}</p>
            <ol className="trabalhos__lista">
              {g.trabalhos.map((t, i) => (
                <li key={`${g.numero}-${i}`}>{t}</li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </details>
  );
}
