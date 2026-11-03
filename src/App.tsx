import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PhotoDrift } from "./components/PhotoDrift";
import {
  Case,
  Encounter,
  Footer,
  Homage,
  LocalFaq,
  Opening,
  Organizations,
  Program,
  Registration,
  Vozes,
} from "./components/Sections";
import { Arrow } from "./components/Motifs";
import { SearchPanel } from "./components/SearchPanel";
import { ToolsDock } from "./components/ToolsDock";
import { PlayerRadio } from "./components/radio/PlayerRadio";
import { CursorEletrico } from "./components/CursorEletrico";
import RastroTexto from "./components/RastroTexto";
import { evento } from "./content/evento";

type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function App() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowCta(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ecnl-theme", next);
    } catch {
      /* modo privado: o tema vale só nesta visita */
    }
  }

  return (
    <>
      <a className="skip-link" href="#encontro">
        Pular para o conteúdo
      </a>

      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main id="conteudo">
        <Hero theme={theme} reducedMotion={reducedMotion} />
        <Opening />
        <Homage />
        <Encounter />
        <Vozes />
        <PhotoDrift reducedMotion={reducedMotion} />
        <Program />
        <Registration />
        <Case />
        <Organizations />
        <LocalFaq />
      </main>

      <Footer />

      <SearchPanel />
      <ToolsDock />
      <PlayerRadio />
      <CursorEletrico />
      <RastroTexto />

      <div className={`mobile-cta${showCta ? " is-visible" : ""}`}>
        <a
          className="btn btn--primary"
          href={evento.links.inscricao}
          target="_blank"
          rel="noopener noreferrer"
        >
          Inscreva-se até 6 de novembro <Arrow />
        </a>
      </div>
    </>
  );
}
