/**
 * Filtro por organização na programação.
 *
 * Serve as duas páginas: RENAP e XI Seminário mostram a mesma programação
 * conjunta, e o leitor muitas vezes quer só a mesa da sua rede. Os botões
 * funcionam como escolha única (Tudo, IPDMS, RENAP, RENAJU, Conjuntas) e
 * mostram quantas atividades daquele dia ficam visíveis.
 *
 * Acessibilidade: é um grupo de botões com aria-pressed, não uma lista de
 * abas — assim não briga com as abas de dia que já existem na seção.
 */
import "../styles/filtro.css";

export type Filtro = "Tudo" | "IPDMS" | "RENAP" | "RENAJU" | "Conjunta";

const ORDEM: Filtro[] = ["Tudo", "IPDMS", "RENAP", "RENAJU", "Conjunta"];

const ROTULO: Record<Filtro, string> = {
  Tudo: "Tudo",
  IPDMS: "IPDMS",
  RENAP: "RENAP",
  RENAJU: "RENAJU",
  Conjunta: "Conjuntas",
};

export function FiltroOrgs({
  valor,
  onChange,
  contagens,
  rotulo = "Filtrar por organização",
}: {
  valor: Filtro;
  onChange: (novo: Filtro) => void;
  contagens: Record<Filtro, number>;
  rotulo?: string;
}) {
  return (
    <div className="filtro" role="group" aria-label={rotulo}>
      <span className="filtro__rotulo" aria-hidden="true">
        Ver por
      </span>

      {ORDEM.map((opcao) => {
        const ativo = valor === opcao;
        const total = contagens[opcao] ?? 0;
        return (
          <button
            key={opcao}
            type="button"
            className={`filtro__botao${ativo ? " is-ativo" : ""}`}
            aria-pressed={ativo}
            onClick={() => onChange(opcao)}
            disabled={total === 0 && opcao !== "Tudo" && !ativo}
          >
            {ROTULO[opcao]}
            <span className="filtro__conta" aria-hidden="true">
              {total}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Conta as atividades de um dia por organização. */
export function contarPorOrgao(
  itens: { tag: string }[],
): Record<Filtro, number> {
  const contagens: Record<Filtro, number> = {
    Tudo: itens.length,
    IPDMS: 0,
    RENAP: 0,
    RENAJU: 0,
    Conjunta: 0,
  };

  for (const item of itens) {
    const chave = item.tag as Filtro;
    if (chave in contagens && chave !== "Tudo") {
      contagens[chave] += 1;
    }
  }

  return contagens;
}
