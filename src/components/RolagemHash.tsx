/**
 * Rolagem para a âncora da URL depois que a página monta.
 *
 * Por que existe: o site é uma SPA — quando o navegador abre
 * `/#carta-politica`, o elemento ainda não existe e ele não rola. Este
 * componente espera o primeiro quadro, tenta de novo depois das imagens e
 * reage a `hashchange` (link clicado dentro da página).
 */
import { useEffect } from "react";

export function RolagemHash() {
  useEffect(() => {
    const ir = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!id) return;
      const alvo = document.getElementById(id);
      if (alvo) alvo.scrollIntoView({ block: "start" });
    };

    ir();
    // Conteúdo tardio (imagens, fontes) muda a altura: insiste algumas vezes.
    const cedo = window.setTimeout(ir, 260);
    const tarde = window.setTimeout(ir, 900);
    const teimoso = window.setTimeout(ir, 1600);
    window.addEventListener("hashchange", ir);

    return () => {
      window.clearTimeout(cedo);
      window.clearTimeout(tarde);
      window.clearTimeout(teimoso);
      window.removeEventListener("hashchange", ir);
    };
  }, []);

  return null;
}
