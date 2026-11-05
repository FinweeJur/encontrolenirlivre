/**
 * Faixa de editais e chamadas — versão curta.
 *
 * Todos os prazos já encerraram, então a faixa antiga (quatro cartões com
 * resumo, prazo e situação) ocupava espaço para dizer o que o leitor não pode
 * mais fazer. Agora fica uma linha com o resultado de cada chamada e o link
 * do documento oficial.
 *
 * Quem quiser o detalhe — prazo, regra de submissão — encontra na página
 * oficial do IPDMS, e o assistente ainda responde com o histórico completo:
 * ele lê `editais.ts`, que continua guardando prazo e situação.
 */
import { editais } from "../content/editais";
import { evento } from "../content/evento";

/** Para onde vai cada resultado: seção interna ou documento oficial. */
const RESULTADOS: Record<string, { texto: string; href: string }> = {
  trabalhos: {
    texto: "Trabalhos aprovados",
    href: "https://ipdms.org.br/wp-content/uploads/2026/07/Trabalhos-Aprovados-1.pdf",
  },
  gds: { texto: "Grupos de discussão", href: "#gds" },
  minicursos: { texto: "Oficinas e minicursos", href: "#oficinas" },
};

/** Na página da RENAP as seções internas moram no site do seminário. */
const URL_XI = "https://seminariovenasabiertas.pages.dev/";

export function Editais({ escopo }: { escopo: "renap" | "seminario" }) {
  const links = editais
    .map((e) => {
      const alvo = RESULTADOS[e.id];
      if (!alvo) return null;
      const href =
        escopo === "renap" && alvo.href.startsWith("#")
          ? `${URL_XI}${alvo.href}`
          : alvo.href;
      return { id: e.id, texto: alvo.texto, href, interno: href.startsWith("#") };
    })
    .filter((l): l is { id: string; texto: string; href: string; interno: boolean } => l !== null);

  return (
    <section className="editais editais--curta" id="editais" aria-labelledby="editais-titulo">
      <div className="editais__shell">
        <div className="editais__faixa">
          <p className="editais__rotulo" id="editais-titulo">
            Editais e chamadas
          </p>
          <p className="editais__fecho">
            {escopo === "seminario"
              ? "Prazos encerrados."
              : "Prazos encerrados no encontro conjunto."}
          </p>

          <ul className="editais__resultados">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.href}
                  {...(l.interno
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {l.texto}
                  <span aria-hidden="true"> {l.interno ? "↓" : "↗"}</span>
                </a>
              </li>
            ))}
          </ul>

          <a
            className="editais__inscricao"
            href={evento.links.inscricao}
            target="_blank"
            rel="noopener noreferrer"
          >
            Inscrições até {evento.inscricoesAte}
            <span aria-hidden="true"> ↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
