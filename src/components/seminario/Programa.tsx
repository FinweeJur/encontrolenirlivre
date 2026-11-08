/**
 * Programação do XI Seminário, em abas por dia.
 *
 * A página da RENAP usa o mesmo desenho de abas; aqui ele ganha teclado
 * (setas, Home e End), entrada em cascata dos itens e destaque de hora no
 * hover. O conteúdo vem de `content/evento.ts`: as três redes compartilham a
 * mesma programação conjunta.
 */
import { useRef, useState } from "react";
import { programaDetalhado } from "../../content/programacaoDetalhada";
import {
  FiltroOrgs,
  contarPorOrgao,
  filtrarPorOrgao,
  useFiltro,
} from "../FiltroOrgs";

export function Programa() {
  const [dia, setDia] = useState(0);
  const [filtro, setFiltro] = useFiltro();
  const abas = useRef<HTMLDivElement>(null);
  const atual = programaDetalhado[dia];

  // Contagem geral dos quatro dias: o número não muda ao trocar de dia.
  const contagens = contarPorOrgao(programaDetalhado.flatMap((d) => d.itens));
  const itens = filtrarPorOrgao(atual.itens, filtro);

  function irPara(indice: number) {
    const total = programaDetalhado.length;
    const destino = (indice + total) % total;
    setDia(destino);
    const botoes = abas.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    botoes?.[destino]?.focus();
  }

  return (
    <div className="xi-prog">
      <div
        className="xi-tabs"
        role="tablist"
        aria-label="Dias do encontro"
        ref={abas}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            irPara(dia + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            irPara(dia - 1);
          } else if (e.key === "Home") {
            e.preventDefault();
            irPara(0);
          } else if (e.key === "End") {
            e.preventDefault();
            irPara(programaDetalhado.length - 1);
          }
        }}
      >
        {programaDetalhado.map((d, i) => (
          <button
            key={d.dia}
            type="button"
            role="tab"
            id={`xi-aba-${d.dia}`}
            aria-selected={i === dia}
            aria-controls="xi-painel"
            tabIndex={i === dia ? 0 : -1}
            className={`xi-tab${i === dia ? " is-ativa" : ""}`}
            onClick={() => setDia(i)}
          >
            <span className="xi-tab__dia">{d.dia}</span>
            <span className="xi-tab__semana">{d.semana}</span>
            <span className="xi-tab__contagem">{d.itens.length} atividades</span>
          </button>
        ))}
      </div>

      <FiltroOrgs valor={filtro} onChange={setFiltro} contagens={contagens} />

      <div
        id="xi-painel"
        className="xi-painel"
        role="tabpanel"
        aria-labelledby={`xi-aba-${atual.dia}`}
        tabIndex={0}
        /* a key força a cascata de entrada a cada troca de dia */
        key={`${atual.dia}-${filtro}`}
      >
        {itens.length === 0 ? (
          <p className="filtro__vazio">
            Nenhuma atividade de {filtro === "Conjunta" ? "conjunta" : filtro} neste
            dia.{" "}
            <button type="button" onClick={() => setFiltro("Tudo")}>
              Ver todas
            </button>
          </p>
        ) : (
          <ol className="xi-painel__lista">
            {itens.map((item, i) => (
              <li
                className="xi-item"
                key={`${atual.dia}-${item.hora}-${i}`}
                style={{ ["--atraso" as string]: `${i * 45}ms` }}
              >
                <span className="xi-item__hora">{item.hora}</span>
                <span className="xi-item__titulo">
                  {item.titulo}
                  {item.local ? (
                    <span className="xi-item__local">{item.local}</span>
                  ) : null}
                </span>
                <em className={`xi-tag xi-tag--${item.tag.toLowerCase()}`}>{item.tag}</em>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
