"use client";

/**
 * Busca expansível do site — no espírito do "expandable search" do Lightswind
 * (o registry `expandable-search` responde 401; não há código público).
 *
 * Abre pela navbar, pelo speed dial ou pelas teclas "/" e Ctrl/Cmd+K. O índice
 * é montado na hora a partir do DOM do próprio site (títulos, parágrafos,
 * itens de lista e perguntas do FAQ), com o id da seção de origem: cada
 * resultado rola até o trecho e destaca a seção por 2 s. Nada de lista
 * paralela que envelhece quando o texto muda.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Trecho = { id: string; secao: string; texto: string };

/** Evento global que abre a busca (navbar e speed dial). */
export const EVENTO_BUSCA = "ecnl:busca-abrir";

export function pedirBusca() {
  window.dispatchEvent(new Event(EVENTO_BUSCA));
}

function normalizar(t: string) {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function indexar(): Trecho[] {
  const main = document.querySelector("main");
  if (!main) return [];
  const trechos: Trecho[] = [];
  const vistos = new Set<string>();

  for (const secao of Array.from(main.querySelectorAll<HTMLElement>("section[id]"))) {
    const titulo =
      secao.querySelector("h1, h2")?.textContent?.trim().replace(/\s+/g, " ") ?? secao.id;
    for (const el of Array.from(
      secao.querySelectorAll<HTMLElement>("h2, h3, h4, p, li, dt, dd, blockquote"),
    )) {
      const texto = (el.textContent ?? "").trim().replace(/\s+/g, " ");
      if (texto.length < 8) continue;
      const chave = normalizar(texto).slice(0, 70);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      trechos.push({ id: secao.id, secao: titulo, texto });
    }
  }
  return trechos;
}

export function SearchPanel() {
  const [aberto, setAberto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [ativo, setAtivo] = useState(0);
  const [indice, setIndice] = useState<Trecho[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);

  const abrir = useCallback(() => {
    setAberto(true);
    setIndice(indexar());
    window.setTimeout(() => inputRef.current?.focus(), 40);
  }, []);

  const fechar = useCallback(() => {
    setAberto(false);
    setConsulta("");
    setAtivo(0);
  }, []);

  useEffect(() => {
    const aoPedir = () => (aberto ? fechar() : abrir());
    window.addEventListener(EVENTO_BUSCA, aoPedir);
    return () => window.removeEventListener(EVENTO_BUSCA, aoPedir);
  }, [aberto, abrir, fechar]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const alvo = ev.target as HTMLElement | null;
      const digitando =
        alvo &&
        (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA" || alvo.isContentEditable);
      if (
        (ev.key === "/" && !digitando) ||
        ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k")
      ) {
        ev.preventDefault();
        aberto ? fechar() : abrir();
      }
      if (ev.key === "Escape" && aberto) fechar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, abrir, fechar]);

  useEffect(() => {
    if (!aberto) return;
    const onDown = (ev: MouseEvent) => {
      if (!caixaRef.current?.contains(ev.target as Node)) fechar();
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [aberto, fechar]);

  const resultados = useMemo(() => {
    const termos = normalizar(consulta).split(/\s+/).filter(Boolean);
    if (termos.length === 0) return [];
    return indice
      .filter((t) => {
        const alvo = normalizar(t.texto + " " + t.secao);
        return termos.every((termo) => alvo.includes(termo));
      })
      .slice(0, 10);
  }, [consulta, indice]);

  const irPara = useCallback(
    (t: Trecho) => {
      fechar();
      const secao = document.getElementById(t.id);
      if (!secao) return;
      secao.scrollIntoView({ behavior: "smooth", block: "start" });
      secao.classList.add("is-alvo-busca");
      window.setTimeout(() => secao.classList.remove("is-alvo-busca"), 2200);
    },
    [fechar],
  );

  function onKeyDown(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (resultados.length === 0) return;
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setAtivo((i) => (i + 1) % resultados.length);
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setAtivo((i) => (i - 1 + resultados.length) % resultados.length);
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      irPara(resultados[ativo] ?? resultados[0]);
    }
  }

  if (!aberto) return null;

  return (
    <div className="busca-fundo" role="dialog" aria-modal="false" aria-label="Busca no site">
      <div className="busca" ref={caixaRef}>
        <div className="busca__topo">
          <svg className="busca__lupa" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="busca__input"
            placeholder="Buscar no site: inscrição, programação, Lenir…"
            value={consulta}
            onChange={(ev) => {
              setConsulta(ev.target.value);
              setAtivo(0);
            }}
            onKeyDown={onKeyDown}
            aria-label="Termo de busca"
            aria-describedby="busca-dica"
            autoComplete="off"
          />
          <button
            type="button"
            className="busca__fechar"
            onClick={fechar}
            aria-label="Fechar a busca"
            title="Fechar (Esc)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <p id="busca-dica" className="busca__dica">
          {consulta.trim().length === 0
            ? "Digite uma palavra. ↑↓ navega, Enter abre, Esc fecha."
            : resultados.length === 0
              ? "Nada encontrado com esse termo."
              : `${resultados.length} resultado${resultados.length > 1 ? "s" : ""}.`}
        </p>

        {resultados.length > 0 && (
          <ul className="busca__lista" role="listbox" aria-label="Resultados">
            {resultados.map((r, i) => (
              <li key={`${r.id}-${i}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === ativo}
                  className={`busca__item${i === ativo ? " is-ativo" : ""}`}
                  onClick={() => irPara(r)}
                  onMouseEnter={() => setAtivo(i)}
                >
                  <span className="busca__secao">{r.secao}</span>
                  <span className="busca__texto">{r.texto}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
