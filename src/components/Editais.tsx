/**
 * Faixa de editais e chamadas, no início das duas páginas.
 *
 * O resumo vem de `content/editais.ts`. Nada de número solto no JSX:
 * prazo, situação e link são os mesmos que o assistente cita. Enquanto
 * houver prazo aberto, o rodapé convida a submeter; quando todos fecham,
 * o texto assume isso com clareza, em vez de fingir que ainda dá tempo.
 */
import { editais } from "../content/editais";
import { evento } from "../content/evento";

export function Editais({ escopo }: { escopo: "renap" | "seminario" }) {
  const abertos = editais.filter((e) => e.status === "aberto");

  const nota =
    escopo === "renap"
      ? "O 30º Encontro da RENAP acontece junto ao XI Seminário do IPDMS e ao 20º Encontro da RENAJU. Os editais abaixo são do encontro conjunto; cada card leva ao documento oficial."
      : "Os editais abaixo são do encontro conjunto — XI Seminário do IPDMS, 30º Encontro da RENAP e 20º Encontro da RENAJU. Cada card leva ao documento oficial no site do IPDMS.";

  return (
    <section className="editais" id="editais" aria-labelledby="editais-titulo">
      <div className="editais__shell">
        <div className="editais__topo">
          <p className="editais__rotulo">Editais e chamadas</p>
          <h2 id="editais-titulo" className="editais__titulo">
            O que está publicado
          </h2>
          <p className="editais__nota">{nota}</p>
        </div>

        <ul className="editais__lista">
          {editais.map((e, i) => (
            <li className="edital" key={e.id}>
              <p className="edital__meta">
                <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                {e.tipo}
              </p>
              <h3 className="edital__titulo">{e.titulo}</h3>
              <p className="edital__resumo">{e.resumo}</p>
              <dl className="edital__dados">
                <dt>Prazo</dt>
                <dd>{e.prazo}</dd>
                <dt>Situação</dt>
                <dd>
                  <span className={`edital__selo edital__selo--${e.status}`}>
                    {e.situacao}
                  </span>
                </dd>
              </dl>
              <a
                className="edital__link"
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {e.urlTexto}
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="editais__rodape">
          {abertos.length > 0 ? (
            <>
              Há {abertos.length} chamada{abertos.length > 1 ? "s" : ""} com prazo
              aberto. As inscrições do encontro vão até {evento.inscricoesAte} de
              2026.{" "}
            </>
          ) : (
            <>
              Todos os prazos de submissão já encerraram. As inscrições do
              encontro vão até {evento.inscricoesAte} de 2026.{" "}
            </>
          )}
          <a href={evento.links.inscricao} target="_blank" rel="noopener noreferrer">
            Inscrever-se no SIGEventos
          </a>{" "}
          ·{" "}
          <a href="#programacao">Ver a programação</a>
        </p>
      </div>
    </section>
  );
}
