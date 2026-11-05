/**
 * Oficinas e minicursos do XI Seminário.
 *
 * A inscrição é separada da inscrição geral: cada oficina tem formulário
 * próprio e 30 vagas. Os dados vêm de `content/oficinas.ts`; aqui só entra o
 * desenho — dia, hora, título e um botão pequeno com ímã leve.
 */
import { oficinaResumo, oficinas } from "../../content/oficinas";
import { Magnet } from "./Magnet";
import "../../styles/oficinas.css";

export function Oficinas() {
  return (
    <section className="xi-secao xi-oficinas" id="oficinas" aria-labelledby="xi-oficinas-titulo">
      <div className="xi-casca">
        <div className="xi-oficinas__topo">
          <div>
            <p className="xi-rotulo">Oficinas e minicursos</p>
            <h2 id="xi-oficinas-titulo" className="xi-h2">
              {oficinaResumo.total} oficinas,
              <br />
              {oficinaResumo.vagas} vagas cada.
            </h2>
          </div>
          <p className="xi-oficinas__nota">
            A inscrição na oficina é separada da inscrição geral do encontro.
            Cada uma tem formulário próprio e{" "}
            <strong>{oficinaResumo.vagas} vagas</strong> — quem já se inscreveu
            no SIGEventos ainda precisa escolher a oficina aqui.
          </p>
        </div>

        <div className="xi-oficinas__dias">
          {oficinaResumo.dias.map((d) => (
            <div className="xi-oficinas__dia" key={d.dia}>
              <p className="xi-oficinas__data">
                <span>{d.dia}/11</span>
                {d.semana}
              </p>

              <ul className="xi-oficinas__lista">
                {oficinas
                  .filter((o) => o.dia === d.dia)
                  .map((o) => (
                    <li className="xi-oficina" key={o.id}>
                      <span className="xi-oficina__hora">{o.hora}</span>
                      <p className="xi-oficina__titulo">{o.titulo}</p>
                      <Magnet forca={0.1} limite={5}>
                        <a
                          className="xi-oficina__inscricao"
                          href={o.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Inscrever
                          <span aria-hidden="true"> ↗</span>
                          <span className="xi-oficina__oculto">
                            {" "}
                            na oficina {o.titulo}
                          </span>
                        </a>
                      </Magnet>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="xi-nota">
          As inscrições vão para formulários do Google, fora deste site. O site
          não recebe nem guarda os dados preenchidos.
        </p>
      </div>
    </section>
  );
}
