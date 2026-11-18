/**
 * PÃ¡gina do XI SeminÃ¡rio Nacional Direitos, Pesquisa e Movimentos Sociais â€”
 * "Venas abiertas: pesquisas e insurgÃªncias na AmÃ©rica Latina".
 *
 * Mesma estrutura e as mesmas opÃ§Ãµes da pÃ¡gina do 30Âº Encontro da RENAP:
 * barra fixa com busca e tema, menu mÃ³vel, bandeja de ferramentas (busca,
 * rÃ¡dio, texto maior, rolagem), player de rÃ¡dio com Brasil de Fato como
 * padrÃ£o e rodapÃ© completo. O que muda Ã© a identidade: papel kraft com a arte
 * oficial do seminÃ¡rio â€” o punho saindo das raÃ­zes, sobre o sol.
 *
 * Fontes (Fontshare): Zodiak nos tÃ­tulos e Satoshi no texto, como pedido.
 */
import { useEffect, useState } from "react";
import "../../styles/seminario.css";
import ElectricLogo from "../effects/ElectricLogo";
import ElectroBorder from "../lightswind/electro-border";
import { SearchPanel, pedirBusca } from "../SearchPanel";
import { ToolsDock } from "../ToolsDock";
import { PlayerRadio } from "../radio/PlayerRadio";
import { Editais } from "../Editais";
import { Assistente } from "../Assistente";
import { Magnet } from "./Magnet";
import { Programa } from "./Programa";
import { Oficinas } from "./Oficinas";
import { Gds } from "./Gds";
import { BotaoWhatsApp } from "../BotaoWhatsApp";
import { BotaoPix } from "../BotaoPix";
import { AcontecendoAgora } from "../AcontecendoAgora";
import { ContagemInscricoes, FaltamDias } from "../Contagem";
import { LayoutGrid } from "../effects/Extras";
import { RolagemHash } from "../RolagemHash";
import { fotosEncontro } from "../../content/fotosEncontro";
import { DriftFotos } from "../DriftFotos";

const LINKS = {
  inscricao: "https://sigeventos.ufpb.br/eventos/public/evento/SNIPDMS",
  programacao: "https://ipdms.org.br/xi-sn-ipdms/programacao/",
  editais: "https://ipdms.org.br/xi-sn-ipdms/",
  anais: "https://ipdms.org.br/anais/",
  trabalhos:
    "https://ipdms.org.br/wp-content/uploads/2026/07/Trabalhos-Aprovados-1.pdf",
  ipdms: "https://ipdms.org.br/",
  renaju: "https://www.instagram.com/ajupsbrasil/",
  // FormulÃ¡rio da organizaÃ§Ã£o para pedir alojamento (o mesmo da pÃ¡gina da RENAP).
  alojamento: "https://forms.gle/LoSeGv5YGtpNZVaJ6",
  mapa: "https://www.google.com/maps/search/?api=1&query=Universidade+Federal+da+Para%C3%ADba+Campus+I",
};

const PIX = "ipdmscorreio@gmail.com";

/**
 * Fotos do encontro + as duas logos do encontro no fim da grade.
 * A logo entra como cartÃ£o quadrado (public/img/encontro-2026/logo-*.webp),
 * porque o ladrilho recorta em quadrado e cortaria a logo larga.
 */
const fotosComLogos = [
  ...fotosEncontro,
  "/img/encontro-2026/logo-ipdms.webp",
  "/img/encontro-2026/logo-renaju.webp",
];
const EMAIL = "ipdmscorreio@gmail.com";

/** Vermelho da paleta (igual ao tema claro da pÃ¡gina da RENAP). */
const VERMELHO = "#bf2a26";

/**
 * Em tela pequena o ElectricLogo sai de cena e entra a logo estÃ¡tica.
 * Motivo duplo: abaixo de ~900 px o canvas do shader pintava um retÃ¢ngulo
 * branco com Ã­cone de imagem quebrada, e em aparelho sem WebGL ele nem pinta.
 */
function useTelaPequena(limite = 640) {
  const [pequena, setPequena] = useState(
    () => typeof window !== "undefined" && window.matchMedia(`(max-width: ${limite}px)`).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${limite}px)`);
    const ouvir = () => setPequena(mq.matches);
    ouvir();
    mq.addEventListener("change", ouvir);
    return () => mq.removeEventListener("change", ouvir);
  }, [limite]);

  return pequena;
}

/** Este site vive em domÃ­nio prÃ³prio; a pÃ¡gina da RENAP aponta de volta. */
const URL_RENAP = "https://encontrolenirlivre.pages.dev/";

const PASSOS = [
  "Crie sua conta no SIGEventos da UFPB e escolha IPDMS, RENAP ou RENAJU como instituiÃ§Ã£o.",
  "Confirme o cadastro pelo e-mail e entre no SIGEventos.",
  "Clique em â€œSem vÃ­nculoâ€ e inscreva-se como participante.",
  "Escolha o XI SeminÃ¡rio e confirme a inscriÃ§Ã£o.",
  "Pague a taxa por PIX e envie o comprovante (ou o pedido de isenÃ§Ã£o) por e-mail.",
];

/** Veias abertas: o motivo grÃ¡fico, em SVG, atrÃ¡s do tÃ­tulo. */
function Veias({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 400"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M-20 330C90 310 150 260 200 190S300 60 420 30" />
        <path d="M200 190c-40-26-70-70-96-126" />
        <path d="M200 190c-14 46-52 80-104 100" />
        <path d="M420 30c26 44 60 74 108 92" />
        <path d="M420 30c-24-40-32-70-30-104" />
        <path d="M300 118c34 18 52 48 60 92" />
        <path d="M300 118c-46 4-80-10-108-40" />
        <path d="M-20 120c70 10 120 30 168 62" />
        <path d="M560 190c-40 26-84 40-136 44" />
      </g>
    </svg>
  );
}

type Tema = "claro" | "escuro";

export function SeminarioPage() {
  const [menuAberto, setMenuAberto] = useState(false);
  const telaPequena = useTelaPequena(640);
  const [tema, setTema] = useState<Tema>(() =>
    typeof document !== "undefined" && document.documentElement.dataset.xiTema === "escuro"
      ? "escuro"
      : "claro",
  );
  const [fixou, setFixou] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.xi = "on";
    return () => {
      delete document.documentElement.dataset.xi;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setFixou(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function alternarTema() {
    const proximo: Tema = tema === "claro" ? "escuro" : "claro";
    setTema(proximo);
    document.documentElement.dataset.xiTema = proximo;
    try {
      localStorage.setItem("ecnl-xi-tema", proximo);
    } catch {
      /* modo privado */
    }
  }

  return (
    <>
      <a className="xi-pular" href="#xi-conteudo">
        Pular para o conteÃºdo
      </a>

      <header className={`xi-topo${fixou ? " is-fixa" : ""}`}>
        <div className="xi-casca xi-topo__linha">
          <a className="xi-marca" href="#topo" aria-label="XI SeminÃ¡rio do IPDMS â€” inÃ­cio">
            <span className="xi-marca__sigla">XI</span>
            <span className="xi-marca__texto">
              <strong>SeminÃ¡rio do IPDMS</strong>
              <small>Direitos, Pesquisa e Movimentos Sociais</small>
            </span>
          </a>

          <nav className="xi-nav" aria-label="NavegaÃ§Ã£o do seminÃ¡rio">
            <a href="#sobre">Sobre</a>
            <a href="#editais">Editais</a>
            <a href="#programacao">ProgramaÃ§Ã£o</a>
            <a href="#gds">GDs</a>
            <a href="#fotos-encontro">Fotos</a>
            <a href="#inscricoes">InscriÃ§Ãµes</a>
            <a href="#tres">Os trÃªs encontros</a>
          </nav>

          <div className="xi-acoes">
            {/* Atalho direto para a programaÃ§Ã£o, igual ao da pÃ¡gina da RENAP. */}
            <a
              className="xi-icone"
              href="#programacao"
              aria-label="Ir para a programaÃ§Ã£o"
              title="Ir para a programaÃ§Ã£o"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
                <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
              </svg>
            </a>

            <button
              type="button"
              className="xi-icone"
              onClick={pedirBusca}
              aria-label="Buscar no site"
              title="Buscar no site (tecla /)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </button>

            <button
              type="button"
              className="xi-icone"
              onClick={alternarTema}
              aria-label={tema === "claro" ? "Ativar tema escuro" : "Ativar tema claro"}
              title={tema === "claro" ? "Tema escuro" : "Tema claro"}
            >
              {tema === "claro" ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" fill="currentColor" />
                  <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
                  </g>
                </svg>
              )}
            </button>

            <Magnet limite={6}>
              <a className="xi-ponte" href={URL_RENAP}>
                <span>30Âº Encontro da RENAP</span>
                <span aria-hidden="true">â†’</span>
              </a>
            </Magnet>

            <button
              type="button"
              className="xi-menu-btn"
              aria-expanded={menuAberto}
              aria-controls="xi-menu"
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuAberto((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>

        <div id="xi-menu" className={`xi-menu${menuAberto ? " is-aberto" : ""}`}>
          <a href="#sobre" onClick={() => setMenuAberto(false)}>Sobre</a>
          <a href="#editais" onClick={() => setMenuAberto(false)}>Editais</a>
          <a href="#programacao" onClick={() => setMenuAberto(false)}>ProgramaÃ§Ã£o</a>
          <a href="#oficinas" onClick={() => setMenuAberto(false)}>Oficinas e minicursos</a>
          <a href="#gds" onClick={() => setMenuAberto(false)}>Grupos de DiscussÃ£o</a>
          <a href="#fotos-encontro" onClick={() => setMenuAberto(false)}>Fotos</a>
          <a href="#inscricoes" onClick={() => setMenuAberto(false)}>InscriÃ§Ãµes</a>
          <a href="#tres" onClick={() => setMenuAberto(false)}>Os trÃªs encontros</a>
          <a href="#local" onClick={() => setMenuAberto(false)}>Onde e como</a>
          <a href={URL_RENAP} onClick={() => setMenuAberto(false)}>30Âº Encontro da RENAP â†’</a>
        </div>
      </header>

      <main id="xi-conteudo">
        <section className="xi-hero" id="topo" aria-labelledby="xi-titulo">
          {/* Faixa do que estÃ¡ acontecendo agora, abaixo da barra fixa. */}
          <div className="xi-hero__faixa">
            <AcontecendoAgora />
          </div>

          <Veias className="xi-hero__veias" />
          <div className="xi-casca xi-hero__grade">
            <div className="xi-hero__texto">
              <p className="xi-kicker">
                XI SeminÃ¡rio Nacional Direitos, Pesquisa e Movimentos Sociais
              </p>
              <h1 id="xi-titulo" className="xi-hero__titulo">
                Venas
                <br />
                abiertas
              </h1>
              <p className="xi-hero__tema">
                pesquisas e insurgÃªncias na AmÃ©rica Latina
              </p>
              <p className="xi-hero__meta">
                11 a 14 de novembro de 2026 Â· UFPB Â· JoÃ£o Pessoa/PB
              </p>
              <FaltamDias className="xi-hero__faltam" />

              <div className="xi-hero__acoes">
                <Magnet>
                  <a
                    className="xi-btn xi-btn--cheio"
                    href={LINKS.inscricao}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inscreva-se
                  </a>
                </Magnet>
                <Magnet>
                  {/* Desce para a programaÃ§Ã£o da prÃ³pria pÃ¡gina; o site do
                      IPDMS fica sÃ³ no link discreto da nota. */}
                  <a className="xi-btn xi-btn--linha" href="#programacao">
                    ProgramaÃ§Ã£o completa
                  </a>
                </Magnet>
              </div>

              <p className="xi-hero__nota">
                InscriÃ§Ãµes atÃ© 6 de novembro de 2026. O seminÃ¡rio acontece junto
                ao 30Âº Encontro da RENAP e ao 20Âº Encontro da RENAJU.
              </p>
            </div>

            {/* Arte oficial: o punho saindo das raÃ­zes, sobre o sol. */}
            <div className="xi-hero__arte">
              <div className="xi-hero__marca">
                {telaPequena ? (
                  <img
                    className="xi-logo-estatico"
                    src="/img/ipdms-logo.png"
                    alt="IPDMS â€” Instituto de Pesquisa, Direitos e Movimentos Sociais"
                    width={344}
                    height={293}
                  />
                ) : (
                  <ElectricLogo
                    src="/img/ipdms-logo.png"
                    className="xi-logo-electrico"
                    color={VERMELHO}
                    glowColor={VERMELHO}
                    theme="dark"
                    /* 0.88: o shader desenha o contorno por fora da forma; em
                       escala 1 o "s" e a segunda linha encostavam na borda. */
                    scale={0.88}
                    /* No tema escuro o traÃ§o fino jÃ¡ brilha sozinho: baixa a
                       intensidade para nÃ£o estourar o contraste com o fundo. */
                    intensity={tema === "escuro" ? 0.55 : 1.1}
                    glow={0}
                    thickness={tema === "escuro" ? 0.7 : 0.9}
                    strands={1}
                    bend={0.35}
                    crackle={tema === "escuro" ? 0.5 : 0.85}
                    fill={0}
                    flicker={tema === "escuro" ? 0.25 : 0.45}
                    speed={0.45}
                  />
                )}
              </div>

              <div className="xi-hero__raizes">
                <img
                  src="/img/xi-raizes.png"
                  alt="Punho erguido saindo de raÃ­zes, sobre o sol â€” arte do XI SeminÃ¡rio"
                  width="568"
                  height="477"
                />
              </div>
            </div>
          </div>
        </section>

        <Editais escopo="seminario" />

        <section className="xi-secao" id="sobre" aria-labelledby="xi-sobre-titulo">
          <div className="xi-casca xi-grade2">
            <div>
              <p className="xi-rotulo">Sobre</p>
              <h2 id="xi-sobre-titulo" className="xi-h2">
                Pesquisa conectada
                <br />
                Ã s lutas por direitos.
              </h2>
            </div>
            <div className="xi-texto">
              <p>
                O XI SeminÃ¡rio reÃºne pesquisadoras, pesquisadores, estudantes,
                extensionistas e integrantes de movimentos sociais de todo o
                paÃ­s para articular uma agenda de pesquisa conectada Ã s teorias
                crÃ­ticas ao Direito e Ã s lutas por direitos no Brasil e na
                AmÃ©rica Latina.
              </p>
              <p>
                O ponto de partida Ã© a conjuntura de ataques Ã  soberania na
                regiÃ£o. O encontro dÃ¡ continuidade ao trabalho do IPDMS de
                produzir conhecimento comprometido com processos de
                transformaÃ§Ã£o e aprofundamento democrÃ¡tico.
              </p>
              <p>
                Em paralelo, acontecem o <strong>30Âº Encontro Nacional da
                RENAP</strong> e o <strong>20Âº Encontro da RENAJU</strong>, com
                programaÃ§Ã£o prÃ³pria e momentos conjuntos.
              </p>
            </div>
          </div>
        </section>

        <section
          className="xi-secao xi-secao--creme xi-secao--grade"
          id="programacao"
          aria-labelledby="xi-prog-titulo"
        >
          <LayoutGrid />
          <div className="xi-casca">
            <p className="xi-rotulo">ProgramaÃ§Ã£o</p>
            <h2 id="xi-prog-titulo" className="xi-h2">
              Quatro dias,
              <br />
              trÃªs encontros.
            </h2>

            <Programa />

            <p className="xi-nota">
              ProgramaÃ§Ã£o sujeita a atualizaÃ§Ã£o pela organizaÃ§Ã£o.{" "}
              <a href={LINKS.programacao} target="_blank" rel="noopener noreferrer">
                Ver a versÃ£o oficial
              </a>{" "}
              Â·{" "}
              <a href="#gds">Ver os GDs e os trabalhos aprovados</a>{" "}
              Â·{" "}
              <a href="/programa.html">Programa para imprimir</a>
              {" Â· "}
              <a href="https://encontrolenirlivre.pages.dev/checkin">
                Lista de presenÃ§a
              </a>
            </p>

            {/* InformaÃ§Ã£o da organizaÃ§Ã£o que nÃ£o estÃ¡ na grade de horas. */}
            <aside className="xi-aviso" aria-label="LanÃ§amento de livros">
              <p className="xi-aviso__rotulo">LanÃ§amento de livros Â· 12/11, 19h</p>
              <p>
                No <strong>ArmazÃ©m do Campo</strong>, oito obras de advogadas,
                advogados, pesquisadoras e movimentos sociais. Precisa que ao
                menos uma pessoa autora ou organizadora esteja presente.
              </p>
              <p>
                <a href="/lancamentos">Ver os 8 tÃ­tulos, autorias e sinopses</a>
              </p>
            </aside>
            <div className="compartilhar">
              <BotaoWhatsApp
                texto="ProgramaÃ§Ã£o do XI SeminÃ¡rio do IPDMS â€” Venas Abiertas, em JoÃ£o Pessoa, de 11 a 14 de novembro."
                url="https://seminariovenasabiertas.pages.dev/#programacao"
              />
            </div>
          </div>
        </section>

        <Oficinas />

        <Gds />

        <section
          className="xi-secao xi-secao--creme"
          id="fotos-encontro"
          aria-labelledby="xi-fotos-titulo"
        >
          <div className="xi-casca xi-fotos-topo">
            <p className="xi-rotulo">O encontro em imagens</p>
            <h2 id="xi-fotos-titulo" className="xi-h2">
              Rostos
              <br />
              do encontro.
            </h2>
            <p className="xi-fotos-texto">
              Quatro dias no Campus I da UFPB, em JoÃ£o Pessoa, com os GDs, as
              oficinas e a mÃ­stica da advocacia popular. Fotos do acervo da
              organizaÃ§Ã£o.
            </p>
          </div>
          <DriftFotos imagens={fotosComLogos} altura="clamp(24rem, 54vw, 40rem)" />
        </section>

        <section className="xi-secao" id="inscricoes" aria-labelledby="xi-insc-titulo">
          <div className="xi-casca xi-grade2">
            <div>
              <p className="xi-rotulo">InscriÃ§Ãµes</p>
              <h2 id="xi-insc-titulo" className="xi-h2">
                Como
                <br />
                se inscrever.
              </h2>
              <div className="compartilhar">
                <BotaoWhatsApp
                  texto="InscriÃ§Ãµes para o XI SeminÃ¡rio do IPDMS â€” Venas Abiertas, em JoÃ£o Pessoa."
                  url="https://seminariovenasabiertas.pages.dev/#inscricoes"
                />
              </div>
              <table className="xi-valores">
                <caption>Valores</caption>
                <tbody>
                  <tr>
                    <th scope="row">Advogadas/os e pÃ³s-graduaÃ§Ã£o</th>
                    <td>R$ 100</td>
                  </tr>
                  <tr>
                    <th scope="row">Estudantes de graduaÃ§Ã£o</th>
                    <td>R$ 50</td>
                  </tr>
                </tbody>
              </table>
              <p className="xi-pix">
                <span>PIX</span>
                <strong>{PIX}</strong>
              </p>
              <BotaoPix valor={PIX} />
              <ContagemInscricoes />
            </div>

            <div className="xi-texto">
              <ol className="xi-passos">
                {PASSOS.map((p, i) => (
                  <li key={p}>
                    <span>{i + 1}</span>
                    <p>{p}</p>
                  </li>
                ))}
              </ol>
              <p className="xi-nota">
                Comprovante e pedidos de isenÃ§Ã£o:{" "}
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Este site nÃ£o processa
                pagamentos nem guarda seus dados.
              </p>
              <ul className="xi-lista-fina">
                <li>
                  <strong>IsenÃ§Ã£o:</strong> escreva para{" "}
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a> com o assunto
                  â€œSolicitaÃ§Ã£o de IsenÃ§Ã£o â€“ XI SeminÃ¡rio IPDMSâ€, informando nome
                  completo, categoria, justificativa e e-mail de contato.
                </li>
                <li>
                  <strong>Alojamento:</strong> a vaga sai do formulÃ¡rio da
                  organizaÃ§Ã£o, com nome, contato e dados de chegada e
                  permanÃªncia.{" "}
                  <a
                    href={LINKS.alojamento}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FormulÃ¡rio do alojamento
                  </a>
                </li>
                <li>
                  <strong>DÃºvidas de submissÃ£o:</strong> secretaria do seminÃ¡rio
                  em{" "}
                  <a href="mailto:ipdmscorreio@gmail.com">
                    ipdmscorreio@gmail.com
                  </a>
                  .
                </li>
              </ul>
              <Magnet>
                <a
                  className="xi-btn xi-btn--cheio"
                  href={LINKS.inscricao}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ir para o SIGEventos
                </a>
              </Magnet>
            </div>
          </div>
        </section>

        <section className="xi-secao xi-secao--creme" id="tres" aria-labelledby="xi-tres-titulo">
          <div className="xi-casca">
            <p className="xi-rotulo">Os trÃªs encontros</p>
            <h2 id="xi-tres-titulo" className="xi-h2">
              Uma mesma luta,
              <br />
              trÃªs programas.
            </h2>

            <div className="xi-cards">
              <ElectroBorder
                className="xi-card"
                borderColor={VERMELHO}
                radius="10px"
                borderWidth={2}
                cardBackground="var(--xi-branco)"
                glowBlur={22}
              >
                <div className="xi-card__interior">
                  <span className="xi-card__num">XI</span>
                  <h3>IPDMS</h3>
                  <p>
                    SeminÃ¡rio Nacional Direitos, Pesquisa e Movimentos Sociais â€”
                    Venas abiertas.
                  </p>
                  <a href={LINKS.ipdms} target="_blank" rel="noopener noreferrer">
                    Site do IPDMS â†—
                  </a>
                </div>
              </ElectroBorder>

              <ElectroBorder
                className="xi-card xi-card--destaque"
                borderColor="#d63b32"
                radius="10px"
                borderWidth={2}
                cardBackground="color-mix(in srgb, #d63b32 7%, var(--xi-branco))"
                glowBlur={26}
              >
                <div className="xi-card__interior">
                  <span className="xi-card__num">30Âº</span>
                  <h3>RENAP</h3>
                  <p>
                    Encontro Nacional da Rede Nacional de Advogadas e Advogados
                    Populares â€” Lenir Correia Livre.
                  </p>
                  <a href={URL_RENAP}>Ver a pÃ¡gina do encontro â†’</a>
                </div>
              </ElectroBorder>

              <ElectroBorder
                className="xi-card"
                borderColor={VERMELHO}
                radius="10px"
                borderWidth={2}
                cardBackground="var(--xi-branco)"
                glowBlur={22}
              >
                <div className="xi-card__interior">
                  <span className="xi-card__num">20Âº</span>
                  <h3>RENAJU</h3>
                  <p>
                    Encontro Nacional da Rede Nacional de Assessoria JurÃ­dica
                    UniversitÃ¡ria â€” MemÃ³rias e dilemas renajupianos.
                  </p>
                  <a href={LINKS.renaju} target="_blank" rel="noopener noreferrer">
                    @ajupsbrasil â†—
                  </a>
                </div>
              </ElectroBorder>
            </div>
          </div>
        </section>

        <section className="xi-secao" id="local" aria-labelledby="xi-local-titulo">
          <div className="xi-casca xi-grade2">
            <div>
              <p className="xi-rotulo">Onde</p>
              <h2 id="xi-local-titulo" className="xi-h2">
                UFPB,
                <br />
                Campus I.
              </h2>
              <p className="xi-texto">
                Universidade Federal da ParaÃ­ba, Campus I â€” Cidade
                UniversitÃ¡ria, s/n, Castelo Branco, JoÃ£o Pessoa/PB. A sala de
                cada atividade Ã© divulgada pela organizaÃ§Ã£o.
              </p>
              <Magnet>
                <a className="xi-btn xi-btn--linha" href={LINKS.mapa} target="_blank" rel="noopener noreferrer">
                  Abrir no mapa
                </a>
              </Magnet>
            </div>
            <div className="xi-contato">
              <p className="xi-rotulo">Contato</p>
              <p>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </p>
              <p>
                <a href={LINKS.editais} target="_blank" rel="noopener noreferrer">
                  PÃ¡gina oficial e editais
                </a>
              </p>
              <p>
                <a href={LINKS.anais} target="_blank" rel="noopener noreferrer">
                  Anais do IPDMS
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="xi-rodape">
        <div className="xi-casca">
          <p className="xi-rodape__huge" aria-hidden="true">
            Venas
            <br />
            abiertas
          </p>

          <div className="xi-rodape__grade">
            <div>
              <p className="xi-rotulo">XI SeminÃ¡rio</p>
              <p className="xi-rodape__datas">
                11â€”14 nov 2026
                <br />
                UFPB Â· JoÃ£o Pessoa/PB
              </p>
              <a className="xi-rodape__mail" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </div>

            <nav aria-label="RodapÃ©">
              <a href="#sobre">Sobre</a>
              <a href="#programacao">ProgramaÃ§Ã£o</a>
              <a href="#oficinas">Oficinas e minicursos</a>
              <a href="#gds">Grupos de DiscussÃ£o</a>
              <a href="#inscricoes">InscriÃ§Ãµes</a>
              <a href="#tres">Os trÃªs encontros</a>
              <a href={`${URL_RENAP}#trabalhos`}>Trabalhos acadÃªmicos (RENAP)</a>
              <a href={LINKS.editais} target="_blank" rel="noopener noreferrer">
                Editais e site do IPDMS
              </a>
              <a href={URL_RENAP}>PÃ¡gina do 30Âº Encontro da RENAP</a>
            </nav>

            <div className="xi-rodape__orgs">
              <a href={LINKS.ipdms} target="_blank" rel="noopener noreferrer">
                IPDMS Â· @institutoipdms
              </a>
              <a href={URL_RENAP}>RENAP Â· @renapbrasil</a>
              <a href={LINKS.renaju} target="_blank" rel="noopener noreferrer">
                RENAJU Â· @ajupsbrasil
              </a>
            </div>
          </div>

          <div className="xi-rodape__base">
            <p>
              Fontes: IPDMS e SIGEventos/UFPB. Arte: banner oficial do XI
              SeminÃ¡rio. Para correÃ§Ãµes, escreva para {EMAIL}.
            </p>
            <p>
              Fontes Zodiak e Satoshi (Fontshare). Componentes React Bits e
              Lightswind.
            </p>
          </div>
        </div>
      </footer>

      <RolagemHash />
      <SearchPanel />
      <ToolsDock />
      <PlayerRadio />
      <Assistente escopo="seminario" />
    </>
  );
}
