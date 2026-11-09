/**
 * Sala da programação com atalho para o mapa.
 *
 * Mostra o texto como está na organização e, ao lado, um pino que abre o
 * OpenStreetMap já com a busca do prédio. O nome do lugar vai no `title`, para
 * quem estiver com o mouse parado saber para onde vai antes de clicar.
 */
import { acharLocal, linkGoogleMaps, linkOpenStreetMap } from "../content/locais";
import { BotaoCopiar } from "./BotaoCopiar";
import "../styles/local-mapa.css";

export function LocalComMapa({ texto }: { texto: string }) {
  const local = acharLocal(texto);

  if (!local) {
    return <span className="local-mapa__texto">{texto}</span>;
  }

  return (
    <span className="local-mapa">
      <span className="local-mapa__texto">{texto}</span>

      <a
        className={`local-mapa__pino local-mapa__pino--${local.tipo}`}
        href={linkOpenStreetMap(local)}
        target="_blank"
        rel="noopener noreferrer"
        title={`Abrir ${local.rotulo} no OpenStreetMap`}
        aria-label={`Abrir ${local.rotulo} no mapa`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {local.tipo === "cultural" ? (
            <path d="M12 3v18M8 7h8M8 17h8" />
          ) : (
            <>
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.4" />
            </>
          )}
        </svg>
      </a>

      <a
        className="local-mapa__google"
        href={linkGoogleMaps(local)}
        target="_blank"
        rel="noopener noreferrer"
        title={`Abrir ${local.rotulo} no Google Maps`}
        aria-label={`Abrir ${local.rotulo} no Google Maps`}
      >
        G
      </a>

      <BotaoCopiar texto={linkOpenStreetMap(local)} rotulo="Link" />
    </span>
  );
}
