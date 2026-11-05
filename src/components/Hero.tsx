import { useEffect, useState } from "react";
import { Arrow, Roots, Sun } from "./Motifs";
import { FaltamDias } from "./Contagem";
import ElectricLogo from "./effects/ElectricLogo";
import DitherVeil from "./effects/DitherVeil";

/**
 * Abaixo de 900 px o ElectricLogo da logo vira imagem estática.
 *
 * Medido no navegador: em 768 px o canvas pintava um retângulo branco com o
 * ícone de imagem quebrada dentro do sol — o traçado não fechava em telas
 * médias. A imagem estática é a mesma logo, sempre visível, e ainda economiza
 * WebGL no celular e no tablet.
 */
function useTelaMedia(limite = 900) {
  const [media, setMedia] = useState(
    () => typeof window !== "undefined" && window.matchMedia(`(max-width: ${limite}px)`).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${limite}px)`);
    const ouvir = () => setMedia(mq.matches);
    ouvir();
    mq.addEventListener("change", ouvir);
    return () => mq.removeEventListener("change", ouvir);
  }, [limite]);

  return media;
}

export function Hero({
  theme,
  reducedMotion,
}: {
  theme: "dark" | "light";
  reducedMotion: boolean;
}) {
  const porta = useTelaMedia(900);
  const estatica = reducedMotion || porta;
  const portrait =
    theme === "dark" ? "/img/portrait-dark.webp" : "/img/portrait-light.webp";
  const logo = theme === "dark" ? "/img/logo-white.png" : "/img/logo-ink.png";
  const paper = theme === "dark" ? "#14110d" : "#e9dfc6";
  const ink = theme === "dark" ? "#f2e8d2" : "#2a2521";

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__atmosphere" aria-hidden="true">
        {/* O sol e a logo dividem o mesmo quadrado: assim a logo fica
            exatamente no centro do círculo do sol em qualquer tela. */}
        <div className="hero__sun-wrap">
          {/* Um só giro para o desenho e o electric: os dois são filhos do
              mesmo contêiner, então giram juntos, no mesmo sentido horário. */}
          <div className="hero__sun-giro">
            <Sun className="hero__sun" />
            {/* Electric leve no SOL inteiro: círculo + raios, sem brilho de
                bloom (glow 0), para não aparecer o retângulo do canvas. */}
            {!estatica && (
              <ElectricLogo
                key={`sol-${theme}`}
                src="/img/sun.png"
                className="hero__sun-electric"
                color={ink}
                glowColor={ink}
                // O prop `theme` força traço BRANCO no tema claro (o shader
                // inverte a cor). Aqui o traço é sempre a cor do tema, então o
                // shader fica no modo escuro.
                theme="dark"
                scale={1}
                intensity={theme === "light" ? 0.9 : 0.55}
                glow={0}
                thickness={theme === "light" ? 0.95 : 0.7}
                strands={1}
                bend={0.35}
                crackle={0.7}
                fill={0}
                flicker={0.35}
                speed={0.3}
              />
            )}
          </div>
          <div className="hero__logo-wrap">
            {estatica ? (
              <img className="hero__logo" src={logo} alt="RENAP" width={900} height={790} />
            ) : (
              <ElectricLogo
                key={theme}
                src={logo}
                className="hero__logo"
                color={ink}
                // Brilho na cor da própria logo: preto no tema claro (kraft),
                // claro no escuro. O vermelho saiu para o efeito não brigar
                // com o sol amarelo atrás.
                glowColor={ink}
                // Mesmo motivo do sol: no tema claro o componente pinta de
                // branco; o shader fica no modo escuro e a cor vem de `color`.
                theme="dark"
                scale={0.95}
                // No kraft o traço fino some no papel: sobe a intensidade.
                intensity={theme === "light" ? 1.9 : 1.3}
                // sem bloom: o brilho desenhado no shader é retangular e
                // denunciava o quadrado do canvas. O traço faz o desenho.
                glow={0}
                thickness={theme === "light" ? 1.35 : 1.1}
                strands={3}
                bend={0.5}
                crackle={1.15}
                fill={0}
                flicker={0.5}
                speed={0.7}
                interactive
                cursorIntensity={1.2}
                cursorRadius={110}
              />
            )}
          </div>
        </div>
        <span className="hero__30">30</span>
      </div>

      <div className="shell hero__grid">
        <div className="hero__copy">
          {/* Marca no celular: o sol com o electric fica escondido no mobile,
              então a logo entra em fluxo, antes do título. */}
          <div className="hero__marca-mobile" aria-hidden="true">
            <img src={logo} alt="" width={132} height={112} />
          </div>

          <div className="hero__prazos">
            <p className="kicker">
              <span className="dot" aria-hidden="true" />
              30º Encontro Nacional da RENAP · 2026
            </p>
            <FaltamDias />
          </div>

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
