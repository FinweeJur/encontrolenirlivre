/**
 * Filtro por organização na programação.
 *
 * Serve as duas páginas: RENAP e XI Seminário mostram a mesma programação
 * conjunta, e o leitor muitas vezes quer só a mesa da sua rede.
 *
 * O filtro é geral: vale para todos os dias, mostra a contagem total de cada
 * organização (não a do dia aberto) e fica guardado no navegador — quem escolhe
 * "IPDMS" não precisa escolher de novo a cada dia nem a cada visita.
 *
 * Acessibilidade: grupo de botões com aria-pressed, não abas — assim não briga
 * com as abas de dia que já existem na seção.
 */
import { useEffect, useState } from "react";
import "../styles/filtro.css";

export type Filtro = "Tudo" | "IPDMS" | "RENAP" | "RENAJU" | "Conjunta";

const ORDEM: Filtro[] = ["Tudo", "IPDMS", "RENAP", "RENAJU", "Conjunta"];

const ROTULO: Record<Filtro, string> = {
  Tudo: "Todas",
  IPDMS: "IPDMS",
  RENAP: "RENAP",
  RENAJU: "RENAJU",
  Conjunta: "Conjuntas",
};

const CHAVE = "ecnl-filtro-programa";

/** Lê a escolha guardada; qualquer valor estranho cai em "Tudo". */
function filtroSalvo(): Filtro {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return ORDEM.includes(bruto as Filtro) ? (bruto as Filtro) : "Tudo";
  } catch {
    return "Tudo";
  }
}

/** Estado do filtro, lembrado entre dias e entre visitas. */
export function useFiltro(): [Filtro, (novo: Filtro) => void] {
  const [filtro, setFiltro] = useState<Filtro>(filtroSalvo);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, filtro);
    } catch {
      /* navegador sem armazenamento: o filtro vale só nesta página */
    }
  }, [filtro]);

  return [filtro, setFiltro];
}

/** Aplica o filtro a uma lista de itens com etiqueta. */
export function filtrarPorOrgao<T extends { tag: string }>(
  itens: T[],
  filtro: Filtro,
): T[] {
  return filtro === "Tudo" ? itens : itens.filter((item) => item.tag === filtro);
}

export function FiltroOrgs({
  valor,
  onChange,
  contagens,
}: {
  valor: Filtro;
  onChange: (novo: Filtro) => void;
  contagens: Record<Filtro, number>;
}) {
  return (
    <div className="filtro" role="group" aria-label="Ver apenas programação do">
      <span className="filtro__rotulo">Ver apenas programação do:</span>

      {ORDEM.map((opcao) => {
        const ativo = valor === opcao;
        return (
          <button
            key={opcao}
            type="button"
            className={`filtro__botao${ativo ? " is-ativo" : ""}`}
            aria-pressed={ativo}
            onClick={() => onChange(opcao)}
          >
            {ROTULO[opcao]}
            <span className="filtro__conta" aria-hidden="true">
              {contagens[opcao] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Conta as atividades por organização somando todos os dias. */
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
