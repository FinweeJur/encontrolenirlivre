import { Arrow, Roots, Sun } from "./Motifs";
import ElectricLogo from "./effects/ElectricLogo";
import DitherVeil from "./effects/DitherVeil";

export function Hero({
  theme,
  reducedMotion,
}: {
  theme: "dark" | "light";
  reducedMotion: boolean;
}) {
  const portrait =
    theme === "dark" ? "/img/portrait-dark.webp" : "/img/portrait-light.webp";
  const logo = theme === "dark" ? "/img/logo-white.png" : "/img/logo-ink.png";
  const paper = theme === "dark" ? "#14110d" : "#e9dfc6";
  const ink = theme === "dark" ? "#f2e8d2" : "#2a2521";

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__atmosphere" aria-hidden="true">
        <Sun className="hero__sun" />
        <span className="hero__30">30</span>
      </div>

      <div className="shell hero__grid">
        <div className="hero__copy">
          <p className="kicker">
            <span className="dot" aria-hidden="true" />
            30º Encontro Nacional da RENAP · 2026
          </p>

          <h1 id="hero-title" className="hero__title">
            <span>Lenir</span>
            <span>Correia</span>
            <span className="hero__title-red">
              Livre
              <svg
                className="hero__underline"
                viewBox="0 0 420 26"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 18C86 8 170 5 246 10c52 3 96 8 170 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="hero__event">
            30º Encontro Nacional da RENAP
            <span aria-hidden="true"> · </span>
            11–14 nov 2026 · UFPB · João Pessoa/PB
          </p>

          <p className="hero__lede">
            O encontro da advocacia popular leva o nome de Lenir Correia como
            bandeira. Advogar pelo povo não é crime.
          </p>

          <div className="hero__actions">
            <a
              className="btn btn--primary"
              href="https://sigeventos.ufpb.br/eventos/public/evento/SNIPDMS"
              target="_blank"
              rel="noopener noreferrer"
            >
              Inscreva-se <Arrow />
            </a>
            <a className="btn btn--ghost" href="#lenir">
              Entenda o caso
            </a>
          </div>

          <p className="hero__deadline">
            <span className="dot" aria-hidden="true" />
            Inscrições até 6 de novembro
          </p>

          <ul className="hero__facts" aria-label="Resumo do evento">
            <li>
              <span>XI</span> Seminário do IPDMS
            </li>
            <li>
              <span>30º</span> Encontro da RENAP
            </li>
            <li>
              <span>20º</span> Encontro da RENAJU
            </li>
          </ul>
        </div>

        <div className="hero__visual">
          <div className="hero__logo-wrap">
            {reducedMotion ? (
              <img className="hero__logo" src={logo} alt="RENAP" />
            ) : (
              <ElectricLogo
                key={theme}
                src={logo}
                className="hero__logo"
                color={ink}
                glowColor="#d63b32"
                theme={theme}
                scale={0.95}
                intensity={1}
                glow={0.35}
                thickness={0.9}
                strands={2}
                bend={0.5}
                crackle={1}
                fill={0}
                flicker={0.5}
                speed={0.6}
                interactive
                cursorIntensity={1.2}
                cursorRadius={110}
              />
            )}
            <span className="hero__logo-caption">RENAP · desde 1995</span>
          </div>

          <div className="hero__portrait">
            <div className="hero__media">
              <img
                className="hero__portrait-fallback"
                src={portrait}
                alt="Retrato de Lenir Correia Coelho"
              />
              {!reducedMotion && (
                <DitherVeil
                  key={`${theme}-dither`}
                  src={portrait}
                  className="hero__dither"
                  pattern="bayer"
                  pixelSize={1}
                  levels={3}
                  palette="duotone"
                  inkColor={paper}
                  paperColor={ink}
                  contrast={1.12}
                  brightness={0.02}
                  revealRadius={120}
                  softness={0.08}
                  linger={1.6}
                  rimColor="#ffffff"
                  rim={0.16}
                  wander
                  reverse={false}
                />
              )}
            </div>
            <span className="hero__portrait-tag">
              Lenir Correia Coelho
              <small>advogada popular · presa política</small>
            </span>
          </div>

          <Roots className="hero__roots" />
        </div>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>
              XI Seminário Nacional IPDMS <i>✦</i> 30º Encontro Nacional da
              RENAP <i>✦</i> 20º Encontro Nacional da RENAJU <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
