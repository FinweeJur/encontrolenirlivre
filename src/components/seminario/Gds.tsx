/**
 * Grupos de Discussão do XI Seminário, com os trabalhos aprovados.
 *
 * Os dados vêm de `content/gds.ts`, extraídos do PDF oficial da organização.
 * A seção mostra o eixo de cada grupo, quantos trabalhos foram aprovados e a
 * lista completa — cada cartão abre e fecha, sem JavaScript, com <details>.
 *
 * Efeitos: entrada em cascata ao rolar (uma vez só), brilho que segue o mouse
 * no cartão e número que ganha o vermelho do tema no hover. Tudo desligado
 * quando a pessoa pede menos movimento no sistema.
 */
import { useEffect, useRef } from "react";
import { gdResumo, gds } from "../../content/gds";
import "../../styles/gds.css";

export function Gds() {
  const lista = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const alvo = lista.current;
    if (!alvo) return;

    const cartoes = Array.from(alvo.querySelectorAll<HTMLElement>(".gd"));
    if (!cartoes.length) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (semMovimento || !("IntersectionObserver" in window)) {
      cartoes.forEach((c) => c.classList.add("is-visivel"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const el = entrada.target as HTMLElement;
          el.classList.add("is-visivel");
          observador.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    cartoes.forEach((c) => observador.observe(c));
    return () => observador.disconnect();
  }, []);

  return (
    <section className="xi-secao gds" id="gds" aria-labelledby="gds-titulo">
      <div className="xi-casca">
        <div className="gds__topo">
          <div>
            <p className="xi-rotulo">Grupos de Discussão</p>
            <h2 id="gds-titulo" className="xi-h2">
              {gdResumo.totalGds} grupos,
              <br />
              {gdResumo.totalTrabalhos} trabalhos.
            </h2>
          </div>
          <div className="gds__resumo">
            <p>
              Os GDs são o coração do seminário: cada grupo reúne pesquisas
              aprovadas em torno de um eixo da luta por direitos. Os títulos
              abaixo são os do documento oficial.
            </p>
            <p className="gds__aviso">
              <span className="gds__selo">Em breve</span>
              Local e horário de cada GD, com a lista de apresentações, serão
              divulgados pela organização.
            </p>
            <a
              className="gds__fonte"
              href={gdResumo.fonte}
              target="_blank"
              rel="noopener noreferrer"
            >
              {gdResumo.fonteNome}
              <span aria-hidden="true"> ↗</span>
            </a>
          </div>
        </div>

        <ol
          className="gds__lista"
          ref={lista}
          onPointerMove={(e) => {
            // Brilho que segue o mouse: só no cartão sob o cursor.
            const cartao = (e.target as HTMLElement).closest<HTMLElement>(".gd__cartao");
            if (!cartao) return;
            const caixa = cartao.getBoundingClientRect();
            cartao.style.setProperty("--mx", `${e.clientX - caixa.left}px`);
            cartao.style.setProperty("--my", `${e.clientY - caixa.top}px`);
          }}
        >
          {gds.map((g, i) => (
            <li
              className="gd"
              key={g.numero}
              style={{ ["--atraso" as string]: `${Math.min(i, 8) * 55}ms` }}
            >
              <article className="gd__cartao">
                <header className="gd__topo">
                  <span className="gd__numero" aria-hidden="true">
                    {String(g.numero).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="gd__eixo">{g.eixo}</p>
                    <h3 className="gd__titulo">
                      <span className="gd__oculto">GD {g.numero}:</span>
                      {g.titulo}
                    </h3>
                  </div>
                </header>

                <p className="gd__contagem">
                  <strong>{g.trabalhos.length}</strong>
                  {g.trabalhos.length === 1 ? " trabalho aprovado" : " trabalhos aprovados"}
                </p>

                <details className="gd__detalhes">
                  <summary>
                    <span className="gd__abre">Ver os títulos</span>
                    <span className="gd__seta" aria-hidden="true">
                      ↓
                    </span>
                  </summary>
                  <ol className="gd__trabalhos">
                    {g.trabalhos.map((t, j) => (
                      <li key={`${g.numero}-${j}`}>{t}</li>
                    ))}
                  </ol>
                </details>
              </article>
            </li>
          ))}
        </ol>

        <p className="gds__pe">
          O documento oficial não lista trabalhos para os GDs 4 e 6. Falta de
          trabalho aprovado não é erro de digitação: é o que está publicado.
        </p>
      </div>
    </section>
  );
}
