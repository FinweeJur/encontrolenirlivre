"use client";

/**
 * Bandeja de ferramentas da página — componente oficial Lightswind
 * `ExpandableSpeedDial` (src/components/lightswind/expandable-speed-dial.tsx).
 *
 * Por que ele existe: busca, descer, subir e rádio eram botões soltos no canto
 * e cobriam conteúdo. Agora ficam escondidos atrás de um único botão que abre
 * em leque. O botão de subir só entra na lista quando a pessoa já desceu.
 *
 * Coordenação com os outros painéis por evento global:
 * - "Buscar" → `pedirBusca()` (SearchPanel escuta);
 * - "Rádio"  → `pedirRadio()` (PlayerRadio escuta).
 */

import { useEffect, useState } from "react";
import { ALargeSmall, ArrowDown, ArrowUp, Headphones, Search } from "lucide-react";
import { ExpandableSpeedDial, type SpeedDialAction } from "./lightswind/expandable-speed-dial";
import { pedirBusca } from "./SearchPanel";
import { pedirRadio } from "./radio/PlayerRadio";

/** Chave do modo de texto maior. */
const CHAVE_TEXTO = "ecnl-texto";

/** Lê o modo salvo e aplica no <html> antes da primeira pintura útil. */
function lerTextoGrande(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.texto === "grande";
}

export function ToolsDock() {
  const [desceu, setDesceu] = useState(false);
  const [textoGrande, setTextoGrande] = useState(lerTextoGrande);

  useEffect(() => {
    const onScroll = () => setDesceu(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Liga/desliga o texto maior e guarda a escolha no navegador. */
  function alternarTexto() {
    const proximo = !textoGrande;
    setTextoGrande(proximo);
    document.documentElement.dataset.texto = proximo ? "grande" : "normal";
    try {
      localStorage.setItem(CHAVE_TEXTO, proximo ? "grande" : "normal");
    } catch {
      /* modo privado: vale só nesta visita */
    }
  }

  /** Próxima seção abaixo da posição atual. */
  function descer() {
    const secoes = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const linha = window.scrollY + 90;
    const alvo = secoes.find((s) => s.offsetTop > linha + 40);
    if (alvo) window.scrollTo({ top: alvo.offsetTop - 76, behavior: "smooth" });
    else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  const acoes: SpeedDialAction[] = [
    { icon: <Search className="h-4 w-4" />, label: "Buscar no site", onClick: pedirBusca },
    { icon: <Headphones className="h-4 w-4" />, label: "Ouvir a rádio", onClick: pedirRadio },
    // Acessibilidade: cresce o texto corrido (os títulos grandes ficam presos
    // pela regra do `html[data-texto]` em global.css).
    {
      icon: <ALargeSmall className="h-4 w-4" />,
      label: textoGrande ? "Voltar ao texto normal" : "Aumentar o texto",
      onClick: alternarTexto,
    },
    { icon: <ArrowDown className="h-4 w-4" />, label: "Descer para a próxima seção", onClick: descer },
  ];

  if (desceu) {
    acoes.push({
      icon: <ArrowUp className="h-4 w-4" />,
      label: "Voltar ao topo",
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    });
  }

  return (
    <div className="tools-dock">
      <ExpandableSpeedDial actions={acoes} direction="up" size="md" />
    </div>
  );
}
