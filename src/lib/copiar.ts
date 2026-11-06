/**
 * Copiar texto para a área de transferência, com dois caminhos.
 *
 * `navigator.clipboard` é o certo, mas falha em três casos comuns:
 * página sem HTTPS, navegador antigo (WebView de Instagram/Facebook) e
 * permissão negada. Nesses casos cai no método antigo — um textarea fora da
 * tela, selecionado e copiado com `execCommand("copy")`, que ainda funciona
 * onde a API nova não existe.
 *
 * Devolve `true` só quando a cópia realmente aconteceu. Nunca finge.
 */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* segue para o método antigo */
  }

  return copiarLegado(texto);
}

function copiarLegado(texto: string): boolean {
  try {
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    // Fora da tela, mas ainda focável: o iOS só copia com seleção real.
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "-9999px";
    area.style.opacity = "0";

    document.body.appendChild(area);

    const selecao = document.getSelection();
    const anterior = selecao && selecao.rangeCount > 0 ? selecao.getRangeAt(0) : null;

    area.select();
    area.setSelectionRange(0, texto.length);

    const copiou = document.execCommand("copy");

    document.body.removeChild(area);
    if (anterior && selecao) {
      selecao.removeAllRanges();
      selecao.addRange(anterior);
    }

    return copiou;
  } catch {
    return false;
  }
}
