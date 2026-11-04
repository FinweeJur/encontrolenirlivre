/**
 * Página do XI Seminário Nacional Direitos, Pesquisa e Movimentos Sociais —
 * "Venas abiertas: pesquisas e insurgências na América Latina".
 *
 * Por que existe separada: o seminário do IPDMS tem público próprio (pesquisa
 * e pós-graduação), mas divide a mesma luta com o 30º Encontro da RENAP. As
 * duas páginas se apontam: quem chega por uma encontra a outra.
 *
 * Identidade: mesma família de cores e a mesma tipografia da página da RENAP
 * (papel kraft, vermelho e amarelo), com a arte oficial do seminário — o punho
 * saindo das raízes, sobre o sol — recortada do banner do IPDMS.
 *
 * Componentes: ElectricLogo (React Bits) nas duas marcas, ElectroBorder
 * (Lightswind) nos cartões e Magnet (referência do React Bits) nos botões.
 */
import { useEffect, useState } from "react";
import "../../styles/seminario.css";
import ElectricLogo from "../effects/ElectricLogo";
import ElectroBorder from "../lightswind/electro-border";
import { Magnet } from "./Magnet";

const LINKS = {
  inscricao: "https://sigeventos.ufpb.br/eventos/public/evento/SNIPDMS",
  programacao: "https://ipdms.org.br/xi-sn-ipdms/programacao/",
  editais: "https://ipdms.org.br/xi-sn-ipdms/",
  anais: "https://ipdms.org.br/anais/",
  trabalhos:
    "https://ipdms.org.br/wp-content/uploads/2026/07/Trabalhos-Aprovados-1.pdf",
  ipdms: "https://ipdms.org.br/",
  mapa: "https://www.google.com/maps/search/?api=1&query=Universidade+Federal+da+Para%C3%ADba+Campus+I",
};

const PIX = "ipdmscorreio@gmail.com";
const EMAIL = "ipdmscorreio@gmail.com";

/** Vermelho da paleta (igual ao tema claro da página da RENAP). */
const VERMELHO = "#bf2a26";

/** Este site vive em domínio próprio; a página da RENAP aponta de volta. */
const URL_RENAP = "https://encontrolenirlivre.pages.dev/";

const DIAS = [
  {
    dia: "11/11",
    rotulo: "quarta",
    itens: [
      ["12h", "Abertura do credenciamento"],
      ["13h", "Apresentação dos trabalhos (Grupos de Discussão)"],
      ["18h", "Mesa de abertura: “Venas abiertas”"],
    ],
  },
  {
    dia: "12/11",
    rotulo: "quinta",
    itens: [
      ["8h30", "IPDMS: avanços e desafios — a reforma do estatuto"],
      ["8h30", "RENAP: análise de conjuntura da advocacia popular"],
      ["13h30", "Apresentação dos trabalhos (Grupos de Discussão)"],
      ["16h", "RENAP: discussões por região"],
      ["19h", "Lançamento de livros e evento cultural"],
    ],
  },
  {
    dia: "13/11",
    rotulo: "sexta",
    itens: [
      ["8h30", "IPDMS: oficinas e minicursos"],
      ["8h30", "RENAP: roda sobre sustentabilidade na advocacia popular"],
      ["8h30", "RENAJU: experiências contemporâneas de AJUP"],
    ],
  },
  {
    dia: "14/11",
    rotulo: "sábado",
    itens: [
      ["manhã", "Grupos de trabalho, plenárias e encerramento"],
      ["—", "Programação detalhada na página oficial do seminário"],
    ],
  },
];

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

export function SeminarioPage() {
  const [menuAberto, setMenuAberto] = useState(false);

  // A raiz do documento ganha o tema do seminário (o CSS usa [data-xi]).
  useEffect(() => {
    document.documentElement.dataset.xi = "on";
    return () => {
      delete document.documentElement.dataset.xi;
    };
  }, []);

  return (
    <>
      <a className="xi-pular" href="#xi-conteudo">
        Pular para o conteúdo
      </a>

      <header className="xi-topo">
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
            <a href="#programacao">Programação</a>
            <a href="#inscricoes">Inscrições</a>
            <a href="#tres">Os três encontros</a>
          </nav>

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

        <div id="xi-menu" className={`xi-menu${menuAberto ? " is-aberto" : ""}`}>
          <a href="#sobre" onClick={() => setMenuAberto(false)}>Sobre</a>
          <a href="#programacao" onClick={() => setMenuAberto(false)}>Programação</a>
          <a href="#inscricoes" onClick={() => setMenuAberto(false)}>Inscrições</a>
          <a href="#tres" onClick={() => setMenuAberto(false)}>Os três encontros</a>
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
                    className="xi-btn"
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

            {/* Arte oficial: o punho saindo das raízes, sobre o sol. A base é a
                imagem recortada do banner; o contorno elétrico vem por cima. */}
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

        <section className="xi-secao xi-secao--creme" id="programacao" aria-labelledby="xi-prog-titulo">
          <div className="xi-casca">
            <p className="xi-rotulo">Programação</p>
            <h2 id="xi-prog-titulo" className="xi-h2">
              Quatro dias,
              <br />
              três encontros.
            </h2>

            <ol className="xi-dias">
              {DIAS.map((d) => (
                <li key={d.dia} className="xi-dia">
                  <p className="xi-dia__data">
                    <span>{d.dia}</span>
                    {d.rotulo}
                  </p>
                  <ul>
                    {d.itens.map(([hora, texto]) => (
                      <li key={hora + texto}>
                        <span className="xi-dia__hora">{hora}</span>
                        <span>{texto}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <p className="xi-nota">
              Programação sujeita a atualização pela organização.{" "}
              <a href={LINKS.programacao} target="_blank" rel="noopener noreferrer">
                Ver a versão oficial
              </a>{" "}
              ·{" "}
              <a href={LINKS.trabalhos} target="_blank" rel="noopener noreferrer">
                Trabalhos aprovados (PDF)
              </a>
            </p>
          </div>
        </section>

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
                  <a
                    href="https://www.instagram.com/ajupsbrasil/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
                <a className="xi-btn" href={LINKS.mapa} target="_blank" rel="noopener noreferrer">
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
        <div className="xi-casca xi-rodape__linha">
          <p>XI Seminário Direitos, Pesquisa e Movimentos Sociais · IPDMS · 2026</p>
          <p className="xi-rodape__ponte">
            Este site também publica o{" "}
            <a href={URL_RENAP}>30º Encontro Nacional da RENAP</a>.
          </p>
        </div>
      </footer>
    </>
  );
}
