/**
 * Página do XI Seminário Nacional Direitos, Pesquisa e Movimentos Sociais —
 * "Venas abiertas: pesquisas e insurgências na América Latina".
 *
 * Mesma estrutura e as mesmas opções da página do 30º Encontro da RENAP:
 * barra fixa com busca e tema, menu móvel, bandeja de ferramentas (busca,
 * rádio, texto maior, rolagem), player de rádio com Brasil de Fato como
 * padrão e rodapé completo. O que muda é a identidade: papel kraft com a arte
 * oficial do seminário — o punho saindo das raízes, sobre o sol.
 *
 * Fontes (Fontshare): Zodiak nos títulos e Satoshi no texto, como pedido.
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
import { Gds } from "./Gds";
import { BotaoPix } from "../BotaoPix";
import { LayoutGrid } from "../effects/Extras";

const LINKS = {
  inscricao: "https://sigeventos.ufpb.br/eventos/public/evento/SNIPDMS",
  programacao: "https://ipdms.org.br/xi-sn-ipdms/programacao/",
  editais: "https://ipdms.org.br/xi-sn-ipdms/",
  anais: "https://ipdms.org.br/anais/",
  trabalhos:
    "https://ipdms.org.br/wp-content/uploads/2026/07/Trabalhos-Aprovados-1.pdf",
  ipdms: "https://ipdms.org.br/",
  renaju: "https://www.instagram.com/ajupsbrasil/",
  // Formulário da organização para pedir alojamento (o mesmo da página da RENAP).
  alojamento: "https://forms.gle/LoSeGv5YGtpNZVaJ6",
  mapa: "https://www.google.com/maps/search/?api=1&query=Universidade+Federal+da+Para%C3%ADba+Campus+I",
};

const PIX = "ipdmscorreio@gmail.com";
const EMAIL = "ipdmscorreio@gmail.com";

/** Vermelho da paleta (igual ao tema claro da página da RENAP). */
const VERMELHO = "#bf2a26";

/** Este site vive em domínio próprio; a página da RENAP aponta de volta. */
const URL_RENAP = "https://encontrolenirlivre.pages.dev/";

const PASSOS = [
  "Crie sua conta no SIGEventos da UFPB e escolha IPDMS, RENAP ou RENAJU como instituição.",
  "Confirme o cadastro pelo e-mail e entre no SIGEventos.",
  "Clique em “Sem vínculo” e inscreva-se como participante.",
  "Escolha o XI Seminário e confirme a inscrição.",
  "Pague a taxa por PIX e envie o comprovante (ou o pedido de isenção) por e-mail.",
];

/** Veias abertas: o motivo gráfico, em SVG, atrás do título. */
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
        Pular para o conteúdo
      </a>

      <header className={`xi-topo${fixou ? " is-fixa" : ""}`}>
        <div className="xi-casca xi-topo__linha">
          <a className="xi-marca" href="#topo" aria-label="XI Seminário do IPDMS — início">
            <span className="xi-marca__sigla">XI</span>
            <span className="xi-marca__texto">
              <strong>Seminário do IPDMS</strong>
              <small>Direitos, Pesquisa e Movimentos Sociais</small>
            </span>
          </a>

          <nav className="xi-nav" aria-label="Navegação do seminário">
            <a href="#sobre">Sobre</a>
            <a href="#editais">Editais</a>
            <a href="#programacao">Programação</a>
            <a href="#gds">GDs</a>
            <a href="#inscricoes">Inscrições</a>
            <a href="#tres">Os três encontros</a>
          </nav>

          <div className="xi-acoes">
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
                <span>30º Encontro da RENAP</span>
                <span aria-hidden="true">→</span>
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
          <a href="#programacao" onClick={() => setMenuAberto(false)}>Programação</a>
          <a href="#gds" onClick={() => setMenuAberto(false)}>Grupos de Discussão</a>
          <a href="#inscricoes" onClick={() => setMenuAberto(false)}>Inscrições</a>
          <a href="#tres" onClick={() => setMenuAberto(false)}>Os três encontros</a>
          <a href="#local" onClick={() => setMenuAberto(false)}>Onde e como</a>
          <a href={URL_RENAP} onClick={() => setMenuAberto(false)}>30º Encontro da RENAP →</a>
        </div>
      </header>

      <main id="xi-conteudo">
        <section className="xi-hero" id="topo" aria-labelledby="xi-titulo">
          <Veias className="xi-hero__veias" />
          <div className="xi-casca xi-hero__grade">
            <div className="xi-hero__texto">
              <p className="xi-kicker">
                XI Seminário Nacional Direitos, Pesquisa e Movimentos Sociais
              </p>
              <h1 id="xi-titulo" className="xi-hero__titulo">
                Venas
                <br />
                abiertas
              </h1>
              <p className="xi-hero__tema">
                pesquisas e insurgências na América Latina
              </p>
              <p className="xi-hero__meta">
                11 a 14 de novembro de 2026 · UFPB · João Pessoa/PB
              </p>

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
                  <a
                    className="xi-btn xi-btn--linha"
                    href={LINKS.programacao}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Programação completa
                  </a>
                </Magnet>
              </div>

              <p className="xi-hero__nota">
                Inscrições até 6 de novembro de 2026. O seminário acontece junto
                ao 30º Encontro da RENAP e ao 20º Encontro da RENAJU.
              </p>
            </div>

            {/* Arte oficial: o punho saindo das raízes, sobre o sol. */}
            <div className="xi-hero__arte">
              <div className="xi-hero__marca">
                <ElectricLogo
                  src="/img/ipdms-logo.png"
                  className="xi-logo-electrico"
                  color={VERMELHO}
                  glowColor={VERMELHO}
                  theme="dark"
                  scale={1}
                  intensity={0.9}
                  glow={0}
                  thickness={0.8}
                  strands={1}
                  bend={0.35}
                  crackle={0.8}
                  fill={0}
                  flicker={0.4}
                  speed={0.45}
                />
              </div>

              <div className="xi-hero__raizes">
                <img
                  src="/img/xi-raizes.png"
                  alt="Punho erguido saindo de raízes, sobre o sol — arte do XI Seminário"
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
                às lutas por direitos.
              </h2>
            </div>
            <div className="xi-texto">
              <p>
                O XI Seminário reúne pesquisadoras, pesquisadores, estudantes,
                extensionistas e integrantes de movimentos sociais de todo o
                país para articular uma agenda de pesquisa conectada às teorias
                críticas ao Direito e às lutas por direitos no Brasil e na
                América Latina.
              </p>
              <p>
                O ponto de partida é a conjuntura de ataques à soberania na
                região. O encontro dá continuidade ao trabalho do IPDMS de
                produzir conhecimento comprometido com processos de
                transformação e aprofundamento democrático.
              </p>
              <p>
                Em paralelo, acontecem o <strong>30º Encontro Nacional da
                RENAP</strong> e o <strong>20º Encontro da RENAJU</strong>, com
                programação própria e momentos conjuntos.
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
            <p className="xi-rotulo">Programação</p>
            <h2 id="xi-prog-titulo" className="xi-h2">
              Quatro dias,
              <br />
              três encontros.
            </h2>

            <Programa />

            <p className="xi-nota">
              Programação sujeita a atualização pela organização.{" "}
              <a href={LINKS.programacao} target="_blank" rel="noopener noreferrer">
                Ver a versão oficial
              </a>{" "}
              ·{" "}
              <a href="#gds">Ver os GDs e os trabalhos aprovados</a>
            </p>

            {/* Informação da organização que não está na grade de horas. */}
            <aside className="xi-aviso" aria-label="Lançamento de livros">
              <p className="xi-aviso__rotulo">Lançamento de livros</p>
              <p>
                O lançamento acontece na <strong>quinta-feira à noite, 12 de
                novembro</strong>, dentro da programação. Precisa que ao menos
                uma pessoa autora ou organizadora esteja presente. A chamada
                para inscrição de obras está encerrada desde 30 de outubro.
              </p>
            </aside>
          </div>
        </section>

        <Gds />

        <section className="xi-secao" id="inscricoes" aria-labelledby="xi-insc-titulo">
          <div className="xi-casca xi-grade2">
            <div>
              <p className="xi-rotulo">Inscrições</p>
              <h2 id="xi-insc-titulo" className="xi-h2">
                Como
                <br />
                se inscrever.
              </h2>
              <table className="xi-valores">
                <caption>Valores</caption>
                <tbody>
                  <tr>
                    <th scope="row">Advogadas/os e pós-graduação</th>
                    <td>R$ 100</td>
                  </tr>
                  <tr>
                    <th scope="row">Estudantes de graduação</th>
                    <td>R$ 50</td>
                  </tr>
                </tbody>
              </table>
              <p className="xi-pix">
                <span>PIX</span>
                <strong>{PIX}</strong>
              </p>
              <BotaoPix valor={PIX} />
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
                Comprovante e pedidos de isenção:{" "}
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Este site não processa
                pagamentos nem guarda seus dados.
              </p>
              <ul className="xi-lista-fina">
                <li>
                  <strong>Isenção:</strong> escreva para{" "}
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a> com o assunto
                  “Solicitação de Isenção – XI Seminário IPDMS”, informando nome
                  completo, categoria, justificativa e e-mail de contato.
                </li>
                <li>
                  <strong>Alojamento:</strong> a vaga sai do formulário da
                  organização, com nome, contato e dados de chegada e
                  permanência.{" "}
                  <a
                    href={LINKS.alojamento}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Formulário do alojamento
                  </a>
                </li>
                <li>
                  <strong>Dúvidas de submissão:</strong> secretaria do seminário
                  em{" "}
                  <a href="mailto:secretaria@ipdms.org.br">
                    secretaria@ipdms.org.br
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
            <p className="xi-rotulo">Os três encontros</p>
            <h2 id="xi-tres-titulo" className="xi-h2">
              Uma mesma luta,
              <br />
              três programas.
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
                    Seminário Nacional Direitos, Pesquisa e Movimentos Sociais —
                    Venas abiertas.
                  </p>
                  <a href={LINKS.ipdms} target="_blank" rel="noopener noreferrer">
                    Site do IPDMS ↗
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
                  <span className="xi-card__num">30º</span>
                  <h3>RENAP</h3>
                  <p>
                    Encontro Nacional da Rede Nacional de Advogadas e Advogados
                    Populares — Lenir Correia Livre.
                  </p>
                  <a href={URL_RENAP}>Ver a página do encontro →</a>
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
                  <span className="xi-card__num">20º</span>
                  <h3>RENAJU</h3>
                  <p>
                    Encontro Nacional da Rede Nacional de Assessoria Jurídica
                    Universitária — Memórias e dilemas renajupianos.
                  </p>
                  <a href={LINKS.renaju} target="_blank" rel="noopener noreferrer">
                    @ajupsbrasil ↗
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
                Universidade Federal da Paraíba, Campus I — João Pessoa/PB. A
                sala de cada atividade é divulgada pela organização.
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
                  Página oficial e editais
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
              <p className="xi-rotulo">XI Seminário</p>
              <p className="xi-rodape__datas">
                11—14 nov 2026
                <br />
                UFPB · João Pessoa/PB
              </p>
              <a className="xi-rodape__mail" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </div>

            <nav aria-label="Rodapé">
              <a href="#sobre">Sobre</a>
              <a href="#programacao">Programação</a>
              <a href="#gds">Grupos de Discussão</a>
              <a href="#inscricoes">Inscrições</a>
              <a href="#tres">Os três encontros</a>
              <a href={LINKS.editais} target="_blank" rel="noopener noreferrer">
                Editais e site do IPDMS
              </a>
              <a href={URL_RENAP}>Página do 30º Encontro da RENAP</a>
            </nav>

            <div className="xi-rodape__orgs">
              <a href={LINKS.ipdms} target="_blank" rel="noopener noreferrer">
                IPDMS · @institutoipdms
              </a>
              <a href={URL_RENAP}>RENAP · @renapbrasil</a>
              <a href={LINKS.renaju} target="_blank" rel="noopener noreferrer">
                RENAJU · @ajupsbrasil
              </a>
            </div>
          </div>

          <div className="xi-rodape__base">
            <p>
              Fontes: IPDMS e SIGEventos/UFPB. Arte: banner oficial do XI
              Seminário. Para correções, escreva para {EMAIL}.
            </p>
            <p>
              Fontes Zodiak e Satoshi (Fontshare). Componentes React Bits e
              Lightswind.
            </p>
          </div>
        </div>
      </footer>

      <SearchPanel />
      <ToolsDock />
      <PlayerRadio />
      <Assistente escopo="seminario" />
    </>
  );
}
