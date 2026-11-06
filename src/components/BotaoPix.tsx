/**
 * Botão de copiar o PIX do encontro.
 *
 * O endereço aparece em texto na página (quem quiser confere e digita no banco),
 * e este botão copia o mesmo valor para a área de transferência. Sem clipboard
 * API (navegador antigo ou página fora de HTTPS), o botão avisa e não finge ter
 * copiado. Não guarda nada e não envia o endereço para servidor nenhum.
 */
import { useEffect, useRef, useState } from "react";
import { copiarTexto } from "../lib/copiar";
import "../styles/pix.css";

export function BotaoPix({ valor }: { valor: string }) {
  const [estado, setEstado] = useState<"parado" | "copiado" | "falhou">("parado");
  const relogio = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (relogio.current) window.clearTimeout(relogio.current);
    },
    [],
  );

  async function copiar() {
    const deuCerto = await copiarTexto(valor);
    setEstado(deuCerto ? "copiado" : "falhou");

    if (relogio.current) window.clearTimeout(relogio.current);
    relogio.current = window.setTimeout(() => setEstado("parado"), 2600);
  }

  return (
    <span className="copia-pix">
      <button
        type="button"
        className={`copia-pix__botao${estado === "copiado" ? " is-copiado" : ""}`}
        onClick={copiar}
        aria-label={`Copiar o PIX ${valor}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {estado === "copiado" ? (
            <path d="m4.5 12.5 5 5 10-11" />
          ) : (
            <>
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
            </>
          )}
        </svg>
        <span>{estado === "copiado" ? "Copiado" : "Copiar PIX"}</span>
      </button>

      <span className="copia-pix__aviso" role="status" aria-live="polite">
        {estado === "falhou"
          ? "Não consegui copiar. Selecione o endereço e copie à mão."
          : estado === "copiado"
            ? "PIX copiado."
            : ""}
      </span>
    </span>
  );
}
