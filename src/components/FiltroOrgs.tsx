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

export type Filtro =
  | "Tudo"
  | "IPDMS"
  | "RENAP"
  | "RENAJU"
  | "Conjunta"
  | "Cultural";

const ORDEM: Filtro[] = ["Tudo", "IPDMS", "RENAP", "RENAJU", "Conjunta", "Cultural"];

const ROTULO: Record<Filtro, string> = {
  Tudo: "Todas",
  IPDMS: "IPDMS",
  RENAP: "RENAP",
  RENAJU: "RENAJU",
  Conjunta: "Conjuntas",
  Cultural: "Cultural",
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

/** Aplica o filtro: a organização escolhida + o que é de todos. */
export function filtrarPorOrgao<T extends { tag: string }>(
  itens: T[],
  filtro: Filtro,
): T[] {
  if (filtro === "Tudo") return itens;
  if (filtro === "Conjunta") return itens.filter((item) => item.tag === "Conjunta");
  if (filtro === "Cultural") return itens.filter((item) => item.tag === "Cultural");
  // Conjunta e cultural são dos três encontros: não somem no filtro de um só.
  return itens.filter(
    (item) => item.tag === filtro || item.tag === "Conjunta" || item.tag === "Cultural",
  );
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

      {valor !== "Tudo" && valor !== "Conjunta" && valor !== "Cultural" ? (
        <span className="filtro__nota">+ conjuntas e culturais</span>
      ) : null}
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
    Cultural: 0,
  };

  for (const item of itens) {
    const chave = item.tag as Filtro;
    if (chave in contagens && chave !== "Tudo") {
      contagens[chave] += 1;
    }
  }

  return contagens;
}
