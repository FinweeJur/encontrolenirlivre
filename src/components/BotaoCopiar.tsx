/**
 * Botão pequeno de copiar, com retorno visual.
 *
 * Usa o mesmo `copiarTexto` do PIX: tenta a API nova e cai no textarea quando
 * o navegador (WebView de Instagram, por exemplo) não deixa.
 */
import { useState } from "react";
import { copiarTexto } from "../lib/copiar";

type Estado = "parado" | "copiado" | "falhou";

export function BotaoCopiar({
  texto,
  rotulo = "Copiar",
}: {
  texto: string;
  rotulo?: string;
}) {
  const [estado, setEstado] = useState<Estado>("parado");

  async function acao() {
    const deuCerto = await copiarTexto(texto);
    setEstado(deuCerto ? "copiado" : "falhou");
    window.setTimeout(() => setEstado("parado"), 1800);
  }

  return (
    <button
      type="button"
      className={`copiar-mini${estado === "parado" ? "" : ` is-${estado}`}`}
      onClick={acao}
      aria-live="polite"
      title={`Copiar: ${texto}`}
    >
      {estado === "copiado" ? "Copiado" : estado === "falhou" ? "Não deu" : rotulo}
    </button>
  );
}
