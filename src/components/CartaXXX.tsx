/**
 * Carta Política do XXX Encontro Nacional da RENAP — texto integral.
 *
 * O texto vem do blog oficial da RENAP (`content/cartaXXX.ts`, gerado a partir
 * da publicação de 18/11/2026). A seção também abre a grade infinita com as
 * fotos do encontro, por isso as duas coisas vivem juntas: quem chega pela
 * carta vê os rostos, e quem chega pelas fotos encontra o documento.
 *
 * Layout de jornal: olho, título, linha fina, "O essencial", texto em coluna
 * curta, destaque em citação e assinatura. Nada de coluna larga demais.
 */
import { cartaXXX, cartaXXXUrl } from "../content/cartaXXX";
import { fotosEncontro } from "../content/fotosEncontro";
import { BotaoWhatsApp } from "./BotaoWhatsApp";
import { InfinityGrid } from "./InfinityGrid";
import "../styles/carta-xxx.css";

const ESSENCIAL = [
  "30º Encontro Nacional da RENAP, em João Pessoa, junto ao XI Seminário do IPDMS e ao 20º Encontro da RENAJU.",
  "Homenagem a Lenir Correia, presa política em Rondônia, e exigência de liberdade.",
  "Alerta sobre o Congresso mais reacionário e os ataques a direitos, territórios e povos.",
  "Compromisso: advocacia popular como instrumento de resistência e de disputa do Direito.",
];

const MENSAGEM =
  "Carta Política do XXX Encontro Nacional da RENAP, em João Pessoa. Leia na íntegra:";

export function CartaXXX() {
  const [abertura, ...resto] = cartaXXX;
  const meio = Math.ceil(resto.length / 2);
  const primeiraMetade = resto.slice(0, meio);
  const segundaMetade = resto.slice(meio);

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

          <div className="carta__texto">
            {abertura ? <p className="carta__abertura">{abertura.texto}</p> : null}

            {primeiraMetade.map((bloco, indice) =>
              bloco.tipo === "citacao" ? (
                <blockquote key={`c1-${indice}`}>{bloco.texto}</blockquote>
              ) : (
                <p key={`p1-${indice}`}>{bloco.texto}</p>
              ),
            )}

            <figure className="carta__foto">
              <img
                src={fotosEncontro[0]}
                alt="Delegação do XXX Encontro Nacional da RENAP, em João Pessoa"
                width={900}
                height={675}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                XXX Encontro Nacional da RENAP, João Pessoa, novembro de 2026.
              </figcaption>
            </figure>

            {segundaMetade.map((bloco, indice) =>
              bloco.tipo === "citacao" ? (
                <blockquote key={`c2-${indice}`}>{bloco.texto}</blockquote>
              ) : (
                <p key={`p2-${indice}`}>{bloco.texto}</p>
              ),
            )}

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
        <InfinityGrid
          imagens={fotosEncontro}
          faixas={3}
          altura={210}
          velocidade={24}
          alt="Foto do XXX Encontro"
        />
      </div>
    </section>
  );
}
