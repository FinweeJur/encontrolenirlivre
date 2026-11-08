import { useState } from "react";
import { cartas, evento, faq, organizacoes } from "../content/evento";
import { programaDetalhado, indiceDoDiaAtual } from "../content/programacaoDetalhada";

/** Site proprio do seminario do IPDMS (projeto Cloudflare Pages separado). */
const URL_XI = "https://seminariovenasabiertas.pages.dev/";
import { Arrow, Spark } from "./Motifs";
import { ContagemInscricoes } from "./Contagem";
import { TrabalhosAcademicos } from "./TrabalhosAcademicos";
import { LocalComMapa } from "./LocalComMapa";
import { copiarTexto } from "../lib/copiar";
import {
  FiltroOrgs,
  contarPorOrgao,
  filtrarPorOrgao,
  useFiltro,
} from "./FiltroOrgs";
import { LayoutGrid, ScrollStar } from "./effects/Extras";
import ElectroBorder from "./lightswind/electro-border";
import { Lens } from "./lightswind/lens";

export function SectionHead({ index, label }: { index: string; label: string }) {
  return (
    <div className="section-head">
      <span className="section-index">{index}</span>
      <span className="section-line" aria-hidden="true" />
      <span className="section-label">{label}</span>
    </div>
  );
}

export function Opening() {
  return (
    <section className="section opening" id="encontro" aria-labelledby="abertura-titulo">
      <div className="shell">
        <SectionHead index="01" label="Abertura" />
        <div className="opening__grid">
          <div>
            <h2 id="abertura-titulo" className="h2">
              Três encontros.
              <br />
              <span className="red">Uma mesma luta.</span>
            </h2>
          </div>
          <div className="opening__text">
            <p className="lead">
              De 11 a 14 de novembro de 2026, João Pessoa recebe o 30º Encontro
              Nacional da RENAP. O encontro acontece junto ao XI Seminário
              Nacional Direitos, Pesquisa e Movimentos Sociais (IPDMS) e ao 20º
              Encontro Nacional da RENAJU, na Universidade Federal da Paraíba.
            </p>
            <p>
              Cada encontro tem seu tema. O XI Seminário do IPDMS debate{" "}
              <strong>“Venas abiertas: pesquisas e insurgências na América
              Latina”</strong>. O 30º Encontro da RENAP tem como tema{" "}
              <strong>Lenir Correia Livre</strong>. O 20º Encontro da RENAJU
              trabalha <strong>“Memórias e dilemas renajupianos”</strong>.
            </p>
            <p>
              A programação tem momentos conjuntos e momentos autônomos. Esta
              página reúne a RENAP e aponta para a inscrição e os editais do
              conjunto. A defesa da advocacia popular, dos direitos humanos e
              dos territórios atravessa os quatro dias.
            </p>
            <p className="stamp stamp--inline">
              <Spark /> 11—14 NOV 2026 · UFPB · JOÃO PESSOA
            </p>
          </div>
        </div>

        <div className="lockup" aria-label="Os três encontros">
          {evento.coEventos.map((e) => (
            <article className="lockup__card" key={e.sigla}>
              <span className="lockup__num">{e.numero}</span>
              <h3>{e.nome}</h3>
              <p>{e.tema}</p>
              <span className="lockup__sigla">{e.sigla}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Homage() {
  return (
    <section className="band-red homage" id="lenir" aria-labelledby="homenagem-titulo">
      <div className="shell">
        <SectionHead index="02" label="Homenagem" />
        <div className="homage__top">
          <h2 id="homenagem-titulo" className="homage__title">
            Lenir
            <br />
            Correia
            <br />
            <span>Livre</span>
          </h2>
          <ElectroBorder
            className="homage__quote"
            borderColor="#f6c46a"
            radius="14px"
            borderWidth={2}
            cardBackground="rgba(0, 0, 0, 0.16)"
            glowBlur={26}
          >
            <div className="homage__quote-inner">
              <blockquote>
                “Advogar pelo povo
                <br />
                não é crime.”
              </blockquote>
              <cite>ABRAPO</cite>
            </div>
          </ElectroBorder>
        </div>

        <div className="homage__text">
          <p className="lead">
            Lenir Correia Coelho é advogada popular em Rondônia. Há anos defende
            camponesas, camponeses, indígenas e quilombolas na luta pela terra.
            Em novembro de 2025, foi presa preventivamente na Operação Godos, do
            GAECO do Ministério Público de Rondônia. Segundo a ABRAPO, nenhuma
            testemunha ou suposta vítima a relaciona a qualquer crime. O processo
            corre sob segredo de justiça e ela segue presa sem sentença. Em março
            de 2026, o Tribunal Popular contra os Crimes do Latifúndio a
            reconheceu como prisioneira política e exigiu sua libertação.
          </p>
          <p className="lead">
            O 30º Encontro Nacional da RENAP leva o nome de Lenir como bandeira:
            <strong> Lenir Correia Livre</strong>. Nos encontramos em João
            Pessoa, de 11 a 14 de novembro, junto ao XI Seminário do IPDMS e ao
            20º Encontro da RENAJU, para afirmar que advogar pelo povo não é
            crime. Exigimos a revogação imediata da prisão preventiva, o fim do
            segredo de justiça, a apuração da responsabilidade dos agentes
            públicos e o fim da criminalização da advocacia popular e da luta
            pela terra. <strong>Liberdade para Lenir Correia Coelho!</strong>
          </p>
        </div>

        <div className="homage__foot">
          <p>
            Fonte: A Nova Democracia, 24/08/2026, com base na denúncia da ABRAPO.
          </p>
          <a
            className="text-link"
            href={evento.links.materia}
            target="_blank"
            rel="noopener noreferrer"
          >
            Leia a reportagem completa <Arrow />
          </a>
          <a
            className="text-link"
            href={evento.links.notaRenap}
            target="_blank"
            rel="noopener noreferrer"
          >
            Nota pública da RENAP sobre a Operação Engodo <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}

export function Encounter() {
  // Posição do ponteiro sobre o banner, para o anel fino da lente. A lente do
  // Lightswind não desenha borda de 1 px (a classe `border-1` não existe no
  // Tailwind), então o anel é desenhado aqui, nítido e alinhado ao círculo.
  const [lente, setLente] = useState<{ x: number; y: number } | null>(null);
  const TAMANHO_LENTE = 190;

  return (
    <section className="section encounter" id="o-encontro" aria-labelledby="encontro-titulo">
      <div className="shell">
        <SectionHead index="03" label="O encontro" />
        <div className="encounter__head">
          <h2 id="encontro-titulo" className="h2">
            A força de uma rede
            <br />
            <span className="red">que não se cala.</span>
          </h2>
          <p>
            A RENAP nasceu em 1995 e chega ao 30º encontro nacional como uma
            articulação descentralizada de advogadas, advogados e estudantes
            comprometidos com as lutas populares.
          </p>
        </div>

        <div
          className="encounter__banner"
          onPointerMove={(ev) => {
            const r = ev.currentTarget.getBoundingClientRect();
            setLente({ x: ev.clientX - r.left, y: ev.clientY - r.top });
          }}
          onPointerLeave={() => setLente(null)}
        >
          <Lens
            zoomFactor={1.85}
            lensSize={TAMANHO_LENTE}
            borderRadius="md"
            borderWidth={1}
            borderColor="border-white/40"
            shadowIntensity="heavy"
            animationDuration={0.28}
            /* Borda nítida: com `blurEdge` o recorte desmancha de 60% a 100%
               e o círculo parece borrado. O anel fino é desenhado por CSS. */
            blurEdge={false}
          >
            <img
              src="/img/banner.webp"
              alt="Participantes do encontro da RENAP com bandeiras das organizações"
              loading="lazy"
              decoding="async"
            />
          </Lens>

          {lente && (
            <span
              className="encounter__anel"
              aria-hidden="true"
              style={{
                left: lente.x,
                top: lente.y,
                width: TAMANHO_LENTE,
                height: TAMANHO_LENTE,
              }}
            />
          )}
        </div>

        <a
          className="text-link"
          href={evento.links.ipdms}
          target="_blank"
          rel="noopener noreferrer"
        >
          Página oficial, editais e programação completa <Arrow />
        </a>

        {/* Ponte entre as duas páginas: o seminário tem identidade própria. */}
        <p className="encounter__ponte">
          A página do <a href={URL_XI}>XI Seminário do IPDMS</a> também está
          neste site.
        </p>

        {/* Cartas políticas: em vez de seção própria, uma linha de links —
            o leitor que quer o histórico da rede chega pela publicação. */}
        <div className="encounter__cartas">
          <p className="section-tag">Cartas políticas dos encontros anteriores</p>
          <ul>
            {cartas.map((c) => (
              <li key={c.url}>
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  <span>{c.ano}</span>
                  {c.titulo.replace(/ —.*$/, "")}
                </a>
              </li>
            ))}
            <li>
              <a href={evento.links.encontros} target="_blank" rel="noopener noreferrer">
                <span>+</span>
                Todos os encontros
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Program() {
  // No dia do encontro, abre já no dia certo; fora dele, no dia 12.
  const [dia, setDia] = useState(() => indiceDoDiaAtual() ?? 1);
  const [filtro, setFiltro] = useFiltro();
  const atual = programaDetalhado[dia];

  // Contagem geral, somando os quatro dias: o número não muda ao trocar o dia.
  const contagens = contarPorOrgao(programaDetalhado.flatMap((d) => d.itens));
  const itens = filtrarPorOrgao(atual.itens, filtro);

  return (
    <section className="band-dark program" id="programacao" aria-labelledby="programacao-titulo">
      <LayoutGrid />
      <div className="shell">
        <SectionHead index="04" label="Programação" />
        <div className="program__head">
          <h2 id="programacao-titulo" className="h2">
            Quatro dias
            <br />
            <span className="red">de encontro.</span>
          </h2>
          <p>
            A programação completa, com sala de cada atividade, grupos de
            discussão, oficinas e a programação cultural. Filtre por organização
            para ver só o que interessa.
          </p>
        </div>

        <div className="program__tabs" role="tablist" aria-label="Dias do encontro">
          {programaDetalhado.map((d, i) => (
            <button
              key={d.dia}
              type="button"
              role="tab"
              aria-selected={i === dia}
              aria-controls="programa-dia"
              className={`program__tab${i === dia ? " is-active" : ""}`}
              onClick={() => setDia(i)}
            >
              <span>{d.dia}</span>
              <small>{d.semana}</small>
            </button>
          ))}
        </div>

        <FiltroOrgs valor={filtro} onChange={setFiltro} contagens={contagens} />

        <div
          id="programa-dia"
          role="tabpanel"
          className="program__panel"
        >
          {itens.length === 0 ? (
            <p className="filtro__vazio">
              Nenhuma atividade de {filtro === "Conjunta" ? "conjunta" : filtro} neste
              dia.{" "}
              <button type="button" onClick={() => setFiltro("Tudo")}>
                Ver todas
              </button>
            </p>
          ) : (
            itens.map((item, i) => (
              <article className="program__item" key={`${item.hora}-${i}`}>
                <span className="program__time">{item.hora}</span>
                <div className="program__texto">
                  <h3>{item.titulo}</h3>
                  {item.local ? (
                    <p className="program__local">
                      <LocalComMapa texto={item.local} />
                    </p>
                  ) : null}
                </div>
                <span className={`tag tag--${item.tag.toLowerCase()}`}>{item.tag}</span>
              </article>
            ))
          )}
        </div>

        <div className="program__foot">
          <a className="text-link" href={`${URL_XI}#gds`}>
            GDs e trabalhos aprovados <Arrow />
          </a>
          <a className="text-link" href="/programa.html">
            Programa para imprimir <Arrow />
          </a>
          <span className="program__note">
            Sujeita a atualização pela organização.{" "}
            <a
              className="program__fonte"
              href={evento.links.programacao}
              target="_blank"
              rel="noopener noreferrer"
            >
              Grade oficial no site do IPDMS
            </a>
            .
          </span>
        </div>

        <TrabalhosAcademicos />
      </div>
    </section>
  );
}

export function Registration() {
  const [copied, setCopied] = useState<"parado" | "copiado" | "falhou">("parado");

  async function copyPix() {
    const deuCerto = await copiarTexto(evento.pix);
    setCopied(deuCerto ? "copiado" : "falhou");
    window.setTimeout(() => setCopied("parado"), 2600);
  }

  return (
    <section className="section registration" id="inscricoes" aria-labelledby="inscricoes-titulo">
      <div className="shell">
        <SectionHead index="05" label="Inscrições" />
        <div className="registration__grid">
          <div className="registration__copy">
            <p className="deadline">
              <span>06</span>
              <small>NOV<br />2026</small>
              <em>último dia</em>
            </p>
            <h2 id="inscricoes-titulo" className="h2">
              Garanta
              <br />
              <span className="red">seu lugar.</span>
            </h2>
            <p className="lead">
              As inscrições vão até 6 de novembro. O cadastro é pelo SIGEventos
              da UFPB; o pagamento é por PIX e o comprovante vai por e-mail.
            </p>

            <table className="values">
              <caption>Valores de inscrição</caption>
              <tbody>
                {evento.valores.map((v) => (
                  <tr key={v.categoria}>
                    <th scope="row">{v.categoria}</th>
                    <td>{v.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="note">
              Pedidos de isenção: envie nome, categoria, justificativa e e-mail
              para <a href={`mailto:${evento.email}`}>{evento.email}</a>, com o
              assunto “Solicitação de Isenção – XI Seminário IPDMS”.
            </p>

            <ContagemInscricoes />
          </div>

          <ElectroBorder
            className="registration__card"
            borderColor="#d63b32"
            radius="14px"
            borderWidth={2}
            cardBackground="var(--paper-2)"
            glowBlur={30}
          >
            <div className="reg-card">
              <p className="section-tag">Passo a passo</p>
              <ol className="steps">
                <li>
                  <span>1</span>
                  <p>
                    Crie sua conta no <strong>SIGEventos da UFPB</strong> e
                    escolha RENAP, IPDMS ou RENAJU como instituição.
                  </p>
                </li>
                <li>
                  <span>2</span>
                  <p>
                    Confirme o cadastro pelo e-mail e faça a inscrição como
                    participante no XI Seminário.
                  </p>
                </li>
                <li>
                  <span>3</span>
                  <p>
                    Pague a taxa por PIX para{" "}
                    <strong>{evento.pix}</strong>.
                  </p>
                </li>
                <li>
                  <span>4</span>
                  <p>
                    Envie o comprovante para <strong>{evento.email}</strong>.
                    Pronto: nos vemos em João Pessoa.
                  </p>
                </li>
              </ol>

              <button
                type="button"
                className="pix"
                onClick={copyPix}
                aria-live="polite"
              >
                <span>
                  <small>Chave PIX</small>
                  {evento.pix}
                </span>
                <strong>
                  {copied === "copiado"
                    ? "Copiado"
                    : copied === "falhou"
                      ? "Copie à mão"
                      : "Copiar"}
                </strong>
              </button>

              <a
                className="btn btn--primary btn--block"
                href={evento.links.inscricao}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ir para a inscrição <Arrow />
              </a>

              <div className="housing">
                <p className="housing__title">
                  <strong>Precisa de alojamento?</strong> O evento oferece
                  alojamento a quem responde o formulário da organização.
                </p>
                <a
                  className="housing__link"
                  href={evento.links.alojamento}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preencher o formulário <Arrow />
                </a>
              </div>

              <p className="reg-note">
                Este site não processa pagamentos nem guarda seus dados. A
                inscrição é feita no SIGEventos/UFPB e o alojamento no
                formulário da organização. Dúvidas: {evento.email}.
              </p>
            </div>
          </ElectroBorder>
        </div>
      </div>
    </section>
  );
}

/**
 * Palavra de ordem e citação: a faixa que liga o encontro à história da
 * advocacia popular. A palavra de ordem é da carta do 29º Encontro (2025);
 * a citação é de Luiz Gama (1830–1882), advogado negro que libertou mais de
 * 500 pessoas escravizadas — referência da luta que a RENAP reivindica.
 */
export function Vozes() {
  return (
    <section className="band-dark vozes" aria-labelledby="vozes-titulo">
      <div className="shell vozes__grid">
        <p className="vozes__ordem" id="vozes-titulo">
          Lutando em rede,
          <br />
          <span>esperançaremos</span>
          <br />
          ainda melhor.
        </p>

        <figure className="vozes__cita">
          <blockquote>
            “Todo escravo que mata seu senhor,
            <br />
            age em legítima defesa.”
          </blockquote>
          <figcaption>Luiz Gama, advogado e abolicionista</figcaption>
        </figure>
      </div>
    </section>
  );
}

export function Case() {
  const marcos = [
    {
      ano: "2021",
      titulo: "Operação Canaã",
      texto:
        "Policiais invadem a casa de Lenir e apreendem agendas, celular e computador com dados de clientes.",
    },
    {
      ano: "NOV 2025",
      titulo: "Operação Godos",
      texto:
        "Lenir é presa preventivamente pelo GAECO/MP-RO. A operação também resultou na morte do camponês Elias Camilo.",
    },
    {
      ano: "MAR 2026",
      titulo: "Tribunal Popular",
      texto:
        "O Tribunal Popular contra os Crimes do Latifúndio reconhece Lenir como prisioneira política e exige sua libertação.",
    },
    {
      ano: "AGO 2026",
      titulo: "Denúncia da ABRAPO",
      texto:
        "A ABRAPO denuncia que o sigilo da Operação Godos blinda a perseguição e a criminalização da luta pela terra.",
    },
    {
      ano: "NOV 2026",
      titulo: "30º Encontro da RENAP",
      texto:
        "A rede se reúne em João Pessoa e assume o nome de Lenir como bandeira: Lenir Correia Livre.",
    },
  ];

  return (
    <section className="section case" id="caso" aria-labelledby="caso-titulo">
      <div className="shell">
        <SectionHead index="06" label="O caso" />
        <div className="case__grid">
          <div>
            <h2 id="caso-titulo" className="h2">
              Uma prisão que
              <br />
              <span className="red">interpela a advocacia popular.</span>
            </h2>
            <p className="lead">
              A prisão de Lenir não é um caso isolado. É a face mais visível de
              uma ofensiva contra quem defende camponeses, indígenas,
              quilombolas e movimentos sociais.
            </p>

            <div className="timeline">
              <ScrollStar />
              {marcos.map((m) => (
                <article className="timeline__item" key={m.ano}>
                  <span className="timeline__year">{m.ano}</span>
                  <div>
                    <h3>{m.titulo}</h3>
                    <p>{m.texto}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="demands" aria-label="Exigências da ABRAPO">
            <p className="section-tag">O que exigimos</p>
            <ol>
              <li>Revogação imediata da prisão preventiva e libertação de Lenir.</li>
              <li>Levantamento do segredo de justiça.</li>
              <li>
                Apuração da responsabilidade dos agentes públicos pela
                perseguição.
              </li>
              <li>
                Fim da criminalização do movimento camponês e da advocacia
                popular em Rondônia.
              </li>
            </ol>
            <p className="demands__source">
              Exigências apresentadas pela ABRAPO em agosto de 2026.
            </p>
            <a
              className="text-link"
              href={evento.links.materia}
              target="_blank"
              rel="noopener noreferrer"
            >
              Entenda o caso <Arrow />
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function Organizations() {
  return (
    <section className="section organizations" id="organizacoes" aria-labelledby="orgs-titulo">
      <div className="shell">
        <SectionHead index="07" label="Organizações" />
        <div className="orgs__head">
          <h2 id="orgs-titulo" className="h2">
            Uma rede
            <br />
            <span className="red">de redes.</span>
          </h2>
          <p>
            O encontro é construído por organizações que atuam juntas na defesa
            dos direitos humanos e da assessoria jurídica popular.
          </p>
        </div>

        <div className="orgs">
          {organizacoes.map((o) => (
            <article className="org" key={o.sigla}>
              <span className="org__sigla">{o.sigla}</span>
              <h3>{o.nome}</h3>
              <p>{o.descricao}</p>
              <div className="org__links">
                {o.site && (
                  <a href={o.site} target="_blank" rel="noopener noreferrer">
                    Site <Arrow />
                  </a>
                )}
                <a href={o.instagram} target="_blank" rel="noopener noreferrer">
                  {o.handle} <Arrow />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LocalFaq() {
  return (
    <section className="section local" id="local" aria-labelledby="local-titulo">
      <div className="shell">
        <SectionHead index="08" label="Onde e como" />
        <div className="local__grid">
          <div>
            <h2 id="local-titulo" className="h2">
              João Pessoa,
              <br />
              <span className="red">Campus I.</span>
            </h2>
            <address className="address">
              <strong>Universidade Federal da Paraíba</strong>
              <br />
              Campus I · Cidade Universitária, s/n
              <br />
              Castelo Branco · João Pessoa/PB
              <br />
              11 a 14 de novembro de 2026
            </address>
            <p>
              A sala de cada atividade será divulgada pela organização. Para
              chegar, consulte o mapa do campus.
            </p>
            <a
              className="btn btn--ghost"
              href="https://www.google.com/maps/search/?api=1&query=Universidade+Federal+da+Para%C3%ADba+Campus+I"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver no mapa <Arrow />
            </a>

            <div className="contact">
              <p className="section-tag">Contato</p>
              <a href={`mailto:${evento.email}`}>{evento.email}</a>
              <p>Inscrição, pagamento, isenção e comprovantes.</p>
            </div>
          </div>

          <div className="faq">
            <p className="section-tag">Dúvidas frequentes</p>
            {faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>
                  {f.a}
                  {f.link && (
                    <>
                      {" "}
                      <a
                        className="faq__link"
                        href={f.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {f.link.texto} →
                      </a>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="band-dark footer">
      <div className="shell">
        <p className="footer__huge" aria-hidden="true">
          Lenir
          <br />
          Correia
          <br />
          <span>Livre</span>
        </p>

        <div className="footer__grid">
          <div>
            <p className="section-tag">30º Encontro Nacional da RENAP</p>
            <p className="footer__dates">
              11—14 nov 2026
              <br />
              UFPB · João Pessoa/PB
            </p>
            <a className="footer__mail" href={`mailto:${evento.email}`}>
              {evento.email}
            </a>
          </div>

          <nav aria-label="Rodapé">
            <a href="#encontro">O encontro</a>
            <a href="#lenir">Lenir Correia Livre</a>
            <a href="#programacao">Programação</a>
            <a href="#inscricoes">Inscrições</a>
            <a href={evento.links.ipdms} target="_blank" rel="noopener noreferrer">
              Editais e site do IPDMS
            </a>
            <a href={URL_XI}>Página do XI Seminário do IPDMS</a>
          </nav>

          <div className="footer__orgs">
            {organizacoes.map((o) => (
              <a key={o.sigla} href={o.instagram} target="_blank" rel="noopener noreferrer">
                {o.sigla} · {o.handle}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p>
            Fontes: IPDMS, SIGEventos/UFPB e ABRAPO/A Nova Democracia. Fotos:
            acervo RENAP. Para correções ou remoção de imagem, escreva para{" "}
            {evento.email}.
          </p>
          <p>
            Componentes React Bits e Lightswind. Fontes Clash Display, General
            Sans e Tabular (Fontshare). Atualizado em 03/11/2026.
          </p>
        </div>
      </div>
    </footer>
  );
}
