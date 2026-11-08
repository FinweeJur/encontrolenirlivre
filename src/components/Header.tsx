import { useEffect, useState } from "react";
import { Arrow } from "./Motifs";
import { pedirBusca } from "./SearchPanel";

export function Header({
  theme,
  onToggleTheme,
}: {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function close() {
    setOpen(false);
  }

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="shell header-inner">
        <a className="brand" href="#top" aria-label="30º Encontro Nacional da RENAP — início">
          <img
            className="brand__logo brand__logo--dark"
            src="/img/logo-white.png"
            alt=""
            width="92"
            height="85"
          />
          <img
            className="brand__logo brand__logo--light"
            src="/img/logo-ink.png"
            alt=""
            width="92"
            height="85"
          />
          <span className="brand__text">
            <strong>30º Encontro Nacional</strong>
            <small>RENAP · Lenir Correia Livre</small>
          </span>
        </a>

        <nav className="nav" aria-label="Navegação principal">
          <a href="#encontro">O encontro</a>
          <a href="#editais">Editais</a>
          <a href="#lenir">Lenir</a>
          <a href="#fotos">Fotos</a>
          <a href="#programacao">Programação</a>
          <a href="#inscricoes">Inscrições</a>
        </nav>

        <div className="header-actions">
          {/* Atalho fixo para a programação, inclusive no celular. */}
          <a
            className="nav-programa"
            href="#programacao"
            aria-label="Ir para a programação"
            title="Ir para a programação"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
              <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
            </svg>
          </a>

          {/* Busca expansível na navbar: abre o painel de busca do site. */}
          <button
            type="button"
            className="nav-busca"
            onClick={pedirBusca}
            aria-label="Buscar no site"
            title="Buscar no site (tecla /)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <span className="nav-busca__texto">Buscar</span>
          </button>

          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            title={theme === "dark" ? "Tema claro" : "Tema escuro"}
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
                </g>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <a className="btn btn--primary header-cta" href="#inscricoes">
            Inscreva-se <Arrow />
          </a>

          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="menu-mobile" className={`mobile-menu${open ? " is-open" : ""}`}>
        <nav aria-label="Navegação móvel">
          <a href="#encontro" onClick={close}>O encontro</a>
          <a href="#editais" onClick={close}>Editais</a>
          <a href="#lenir" onClick={close}>Lenir Correia Livre</a>
          <a href="#fotos" onClick={close}>Fotos</a>
          <a href="#programacao" onClick={close}>Programação</a>
          <a href="#inscricoes" onClick={close}>Inscrições</a>
          <a href="#organizacoes" onClick={close}>Organizações</a>
        </nav>
      </div>
    </header>
  );
}
