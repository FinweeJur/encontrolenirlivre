import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SeminarioPage } from "./components/seminario/SeminarioPage";
// As utilitárias do Tailwind existem por causa dos componentes oficiais
// (ElectroBorder usa `absolute`, `inset-0`, etc.). Sem este import, as camadas
// da moldura caem no fluxo e o cartão abre um vão em branco.
import "./styles/tailwind.css";
import "./styles/tools.css";
import "./styles/editais.css";
import "./styles/assistente.css";

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
