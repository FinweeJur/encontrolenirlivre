import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SeminarioPage } from "./components/seminario/SeminarioPage";

/**
 * Entrada da página do XI Seminário do IPDMS (seminario.html).
 * O CSS do seminário é importado pelo próprio componente; aqui não entra o
 * CSS da página da RENAP — são identidades visuais diferentes.
 */
const raiz = document.getElementById("root");
if (raiz) {
  createRoot(raiz).render(
    <StrictMode>
      <SeminarioPage />
    </StrictMode>,
  );
}
