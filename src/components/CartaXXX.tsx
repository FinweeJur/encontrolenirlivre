/**
 * Carta Política do XXX Encontro Nacional da RENAP — texto integral.
 *
 * O texto vem do blog oficial da RENAP (`content/cartaXXX.ts`, gerado a partir
 * da publicação de 2026) e mantém o que o original tem: negrito, sublinhado,
 * destaque (marca-texto), links e as fotos com legenda, na ordem do post.
 *
 * Layout de jornal: olho, título, linha fina, "O essencial", texto em coluna
 * curta, citação e assinatura. No fim, a grade infinita com as fotos do
 * encontro.
 */
import { Fragment, useRef } from "react";
import { cartaXXX, cartaXXXUrl } from "../content/cartaXXX";
import type { TrechoCarta } from "../content/cartaXXX";
import { fotosEncontro } from "../content/fotosEncontro";
import { BotaoWhatsApp } from "./BotaoWhatsApp";
import { DriftFotos } from "./DriftFotos";
import { useGrifoScroll } from "./GrifoScroll";
import "../styles/carta-xxx.css";

const ESSENCIAL = [
  "30º Encontro Nacional da RENAP, em João Pessoa, junto ao XI Seminário do IPDMS e ao 20º Encontro da RENAJU.",
  "Homenagem a Lenir Correia, presa política em Rondônia, e exigência de liberdade.",
  "Alerta sobre o Congresso mais reacionário e os ataques a direitos, territórios e povos.",
  "Compromisso: advocacia popular como instrumento de resistência e de disputa do Direito.",
];

const MENSAGEM =
  "Carta Política do XXX Encontro Nacional da RENAP, em João Pessoa. Leia na íntegra:";

/** Um trecho com as marcas do original: negrito, destaque, sublinhado e link. */
function Trechos({ runs }: { runs: TrechoCarta[] }) {
  return (
    <>
      {runs.map((run, indice) => {
        let conteudo = <>{run.texto}</>;

        // Destaque: cada palavra é uma camada própria. O amarelo entra atrás
        // dela e a letra escurece, como caneta passando — o texto claro do
        // site vai sendo substituído, não coberto por uma faixa.
        if (run.destaque) {
          const pedacos = run.texto.split(/(\s+)/);
          conteudo = (
            <mark className="grifo">
              {pedacos.map((pedaco, pedacoIndice) =>
                /^\s*$/.test(pedaco) ? (
                  <Fragment key={`e-${pedacoIndice}`}>{pedaco}</Fragment>
                ) : (
                  <span className="grifo__p" key={`p-${pedacoIndice}`}>
                    {pedaco}
                  </span>
                ),
              )}
            </mark>
          );
        }

        if (run.negrito) conteudo = <strong>{conteudo}</strong>;
        if (run.sublinhado) conteudo = <u>{conteudo}</u>;
        if (run.link) {
          conteudo = (
            <a href={run.link} target="_blank" rel="noopener noreferrer">
              {conteudo}
            </a>
          );
        }
        return <Fragment key={indice}>{conteudo}</Fragment>;
      })}
    </>
  );
}

export function CartaXXX() {
  const [abertura, ...resto] = cartaXXX;
  const textoRef = useRef<HTMLDivElement>(null);
  useGrifoScroll(textoRef);

  return (
    <section className="carta" id="carta-politica" aria-labelledby="carta-titulo">
      <div className="shell">
        <header className="carta__cabeca">
          <p className="section-tag">Documento final</p>
          <h2 id="carta-titulo" className="carta__titulo">
            Carta Política do<br />
            <span className="carta__destaque">XXX Encontro Nacional</span>
          </h2>
          <p className="carta__linha-fina">
            João Pessoa, Paraíba · 11 a 14 de novembro de 2026 · aprovada no
            encerramento, com o XI Seminário do IPDMS e o 20º Encontro da RENAJU.
          </p>
        </header>

        <div className="carta__grade">
          <aside className="carta__resumo" aria-label="O essencial da carta">
            <h3>O essencial</h3>
            <ul>
              {ESSENCIAL.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="carta__assinatura">
              Lenir, livre!<br />
              Advocacia popular não é crime.
            </p>
          </aside>

          <div className="carta__texto" ref={textoRef}>
            {abertura && abertura.tipo !== "imagem" ? (
              <p className="carta__abertura">
                <Trechos runs={abertura.runs} />
              </p>
            ) : null}

            {resto.map((bloco, indice) => {
              if (bloco.tipo === "imagem") {
                return (
                  <figure className="carta__foto" key={`img-${indice}`}>
                    <img
                      src={bloco.arquivo}
                      alt={bloco.legenda || "Registro do XXX Encontro Nacional da RENAP"}
                      width={900}
                      height={600}
                      loading="lazy"
                      decoding="async"
                    />
                    {bloco.legenda ? <figcaption>{bloco.legenda}</figcaption> : null}
                  </figure>
                );
              }

              if (bloco.tipo === "citacao") {
                return (
                  <blockquote key={`cit-${indice}`}>
                    <Trechos runs={bloco.runs} />
                  </blockquote>
                );
              }

              return (
                <p key={`p-${indice}`}>
                  <Trechos runs={bloco.runs} />
                </p>
              );
            })}

            <div className="carta__acoes">
              <a
                className="btn btn--primary"
                href={cartaXXXUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ler no site da RENAP
              </a>
              <BotaoWhatsApp
                texto={MENSAGEM}
                url="https://encontrolenirlivre.pages.dev/#carta-politica"
                rotulo="Compartilhar a carta no WhatsApp"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="carta__fotos">
        <div className="shell carta__fotos-topo">
          <h3>O encontro em imagens</h3>
          <p>
            Quatro dias de debates, mística e articulação. As fotos são do acervo
            da organização.
          </p>
        </div>
        <DriftFotos imagens={fotosEncontro} altura="clamp(26rem, 58vw, 44rem)" />
      </div>
    </section>
  );
}
