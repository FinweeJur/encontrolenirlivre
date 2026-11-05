/**
 * Grupos de Discussão do XI Seminário com a programação de cada sessão.
 *
 * Antes esta seção só listava os títulos aprovados. Agora usa o PDF de
 * programação enviado pela organização: dia, hora, sala, quem coordena e a
 * ordem de apresentação. O que era "em breve" virou informação.
 *
 * Efeitos: entrada em cascata ao rolar, brilho que segue o mouse e número que
 * ganha o vermelho do tema no hover. Tudo desligado com prefers-reduced-motion.
 */
import { useEffect, useMemo, useRef } from "react";
import { eixosGd, gdSessoes, type SessaoGd } from "../../content/gdSessoes";
import "../../styles/gds.css";

type Grupo = {
  numero: number;
  titulo: string;
  eixo: string;
  sessoes: SessaoGd[];
  trabalhos: number;
};

function agrupar(): Grupo[] {
  const mapa = new Map<number, Grupo>();

  for (const s of gdSessoes) {
    const atual = mapa.get(s.gd);
    if (atual) {
      atual.sessoes.push(s);
      atual.trabalhos += s.trabalhos.length;
      continue;
    }
    mapa.set(s.gd, {
      numero: s.gd,
      titulo: s.titulo,
      eixo: eixosGd[s.gd] ?? "Grupo de discussão",
      sessoes: [s],
      trabalhos: s.trabalhos.length,
    });
  }

  return [...mapa.values()].sort((a, b) => a.numero - b.numero);
}

export function Gds() {
  const lista = useRef<HTMLOListElement>(null);
  const grupos = useMemo(agrupar, []);
  const totalTrabalhos = grupos.reduce((soma, g) => soma + g.trabalhos, 0);

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
              {grupos.length} grupos,
              <br />
              {totalTrabalhos} trabalhos.
            </h2>
          </div>
          <div className="gds__resumo">
            <p>
              Cada grupo se reúne em uma ou mais sessões, com sala e ordem de
              apresentação definidas pela organização. Abra o grupo para ver
              quando e onde ele acontece.
            </p>
            <p className="gds__quando">
              Dois dias de apresentação:{" "}
              <strong>11/11, quarta, 13h</strong> e{" "}
              <strong>12/11, quinta, 13h30</strong>.
            </p>
            <p className="gds__fonte-nota">
              Fonte: programação dos GDs divulgada pela organização em 4 de
              novembro de 2026.
            </p>
          </div>
        </div>

        <ol
          className="gds__lista"
          ref={lista}
          onPointerMove={(e) => {
            const cartao = (e.target as HTMLElement).closest<HTMLElement>(".gd__cartao");
            if (!cartao) return;
            const caixa = cartao.getBoundingClientRect();
            cartao.style.setProperty("--mx", `${e.clientX - caixa.left}px`);
            cartao.style.setProperty("--my", `${e.clientY - caixa.top}px`);
          }}
        >
          {grupos.map((g, i) => (
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
                  <strong>{g.trabalhos}</strong>{" "}
                  {g.trabalhos === 1 ? "trabalho" : "trabalhos"} ·{" "}
                  {g.sessoes.length === 1 ? "1 sessão" : `${g.sessoes.length} sessões`}
                </p>

                <details className="gd__detalhes">
                  <summary>
                    <span className="gd__abre">Ver programação e títulos</span>
                    <span className="gd__seta" aria-hidden="true">
                      ↓
                    </span>
                  </summary>

                  {g.sessoes.map((s, k) => (
                    <div className="gd__sessao" key={`${s.gd}-${s.dia}-${s.hora}-${k}`}>
                      <p className="gd__sessao-quando">
                        <span>{s.dia}</span>
                        {s.semana} · {s.hora}
                        {s.sessao ? ` · ${s.sessao}` : ""}
                      </p>
                      <p className="gd__sessao-sala">{s.sala}</p>

                      {s.subtitulo ? (
                        <p className="gd__sessao-tema">{s.subtitulo}</p>
                      ) : null}

                      {s.coordenacao ? (
                        <p className="gd__sessao-coord">
                          <strong>Coordenação:</strong> {s.coordenacao}
                        </p>
                      ) : null}

                      <ol className="gd__trabalhos">
                        {s.trabalhos.map((t, j) => (
                          <li key={`${s.gd}-${s.dia}-${k}-${j}`}>{t}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </details>
              </article>
            </li>
          ))}
        </ol>

        <p className="gds__pe">
          A organização não abriu GDs 4 e 6 neste encontro. Sala e horário podem
          mudar: confirme com a secretaria em{" "}
          <a href="mailto:secretaria@ipdms.org.br">secretaria@ipdms.org.br</a>.
        </p>
      </div>
    </section>
  );
}
