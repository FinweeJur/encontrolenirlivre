/**
 * Assistente do encontro — bolha no canto inferior esquerdo.
 *
 * Primeiro tenta uma resposta curada (revisada à mão, em
 * `content/assistente.ts`). Se a pergunta não casar com nenhuma, chama
 * `/api/chat`, a Cloudflare Pages Function que consulta o GLM-4-Flash.
 *
 * Por que curada primeiro: prazo, preço e endereço são números que não podem
 * variar nem envelhecer. A resposta revisada também chega na hora, sem
 * depender de rede. O modelo responde o resto — e, se falhar, o site continua
 * com as curadas e uma resposta padrão honesta.
 *
 * Nunca guarda conversa: fechou a página, apagou. Também não pede dado
 * pessoal e não substitui a secretaria do encontro.
 */
import { useEffect, useRef, useState } from "react";
import {
  RESPOSTA_PADRAO,
  SUGESTOES,
  TOPICOS,
  responderCurada,
} from "../content/assistente";

type Papel = "user" | "assistente";

type Mensagem = {
  papel: Papel;
  texto: string;
  /** Resposta pronta, sem modelo. */
  local?: boolean;
};

/**
 * Atalhos fixos que ficam acima do campo depois da primeira mensagem.
 * A ordem aqui é a ordem na tela; o rótulo e a pergunta vêm de `TOPICOS`,
 * então não existe uma segunda versão do texto.
 */
const ATALHOS = ["inscricao", "programacao", "gds", "oficinas", "presenca", "contato"];

const TOPICOS_FIXOS = TOPICOS.filter((topico) => ATALHOS.includes(topico.id));

/** Quebra o texto em pedaços, transformando URLs em links de verdade. */
function ComLinks({ texto }: { texto: string }) {
  // Aceita URL crua e também o formato markdown [texto](url), que o modelo
  // às vezes devolve mesmo quando o pedido é texto simples.
  const partes = texto.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s)]+)/g);

  return (
    <>
      {partes.map((parte, i) => {
        const markdown = parte.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (markdown) {
          return (
            <a
              key={`md-${i}`}
              href={markdown[2]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {markdown[1]}
            </a>
          );
        }
        if (/^https?:\/\//.test(parte)) {
          return (
            <a
              key={`url-${i}`}
              href={parte}
              target="_blank"
              rel="noopener noreferrer"
            >
              {parte}
            </a>
          );
        }
        return <span key={`texto-${i}`}>{parte}</span>;
      })}
    </>
  );
}

export function Assistente({ escopo }: { escopo: "renap" | "seminario" }) {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modoLocal, setModoLocal] = useState(false);
  const [maisAberto, setMaisAberto] = useState(false);

  const campo = useRef<HTMLTextAreaElement>(null);
  const conversa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  /** Muda ao voltar ao início: resposta velha em voo é descartada. */
  const geracao = useRef(0);

  useEffect(() => {
    if (aberto) campo.current?.focus();
  }, [aberto]);

  useEffect(() => {
    const caixa = conversa.current;
    if (caixa) caixa.scrollTop = caixa.scrollHeight;
  }, [mensagens, carregando, aberto]);

  useEffect(() => {
    if (!aberto) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  /** Volta ao estado inicial sem fechar o painel nem perder o foco de lugar. */
  function voltarAoInicio() {
    geracao.current += 1;
    setMensagens([]);
    setTexto("");
    setModoLocal(false);
    setMaisAberto(false);
    setCarregando(false);
    campo.current?.focus();
  }

  async function enviar(pergunta: string) {
    const limpa = pergunta.trim();
    if (!limpa || carregando) return;

    // A pergunta saiu da lista; a lista encolhe para devolver espaço.
    setMaisAberto(false);

    const minhaGeracao = geracao.current;
    const historico: Mensagem[] = [
      ...mensagens,
      { papel: "user", texto: limpa },
    ];
    setMensagens(historico);
    setTexto("");

    // Resposta revisada à mão tem prioridade: número errado aqui é dano.
    const curada = responderCurada(limpa);
    if (curada) {
      setMensagens((atuais) => [
        ...atuais,
        { papel: "assistente", texto: curada.resposta, local: true },
      ]);
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          site: escopo,
          messages: historico.map((m) => ({
            role: m.papel === "user" ? "user" : "assistant",
            content: m.texto,
          })),
        }),
      });

      if (geracao.current !== minhaGeracao) return;
      if (!resposta.ok) throw new Error("sem-modelo");

      const dados = (await resposta.json()) as { resposta?: unknown };
      if (geracao.current !== minhaGeracao) return;
      if (typeof dados.resposta !== "string" || !dados.resposta.trim()) {
        throw new Error("resposta-vazia");
      }

      setMensagens((atuais) => [
        ...atuais,
        { papel: "assistente", texto: dados.resposta as string },
      ]);
    } catch {
      if (geracao.current !== minhaGeracao) return;
      setModoLocal(true);
      setMensagens((atuais) => [
        ...atuais,
        { papel: "assistente", texto: RESPOSTA_PADRAO, local: true },
      ]);
    } finally {
      // Só a requisição da geração atual pode apagar o indicador.
      if (geracao.current === minhaGeracao) setCarregando(false);
    }
  }

  return (
    <>
      <button
        ref={botao}
        type="button"
        className={`assistente__bolha${aberto ? " is-aberta" : ""}`}
        aria-expanded={aberto}
        aria-controls="assistente-painel"
        aria-label={aberto ? "Fechar o assistente do evento" : "Abrir o assistente do evento"}
        onClick={() => setAberto((v) => !v)}
      >
        {aberto ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5.5h16v10.2H9.6L4 19.5V5.5Z" />
            <path d="M8 9.4h8M8 12.6h5" />
          </svg>
        )}
        <span className="assistente__bolha-texto">Pergunte</span>
      </button>

      <section
        id="assistente-painel"
        className={`assistente${aberto ? " is-aberto" : ""}`}
        aria-labelledby="assistente-titulo"
      >
        <header className="assistente__topo">
          <div className="assistente__identidade">
            <p className="assistente__rotulo">Assistente do encontro</p>
            <h2 id="assistente-titulo" className="assistente__titulo">
              Dúvidas sobre o evento
            </h2>
          </div>
          <div className="assistente__acoes">
            <button
              type="button"
              className="assistente__reiniciar"
              onClick={voltarAoInicio}
              aria-label="Voltar ao início e limpar a conversa"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 11.5 12 5l8 6.5" />
                <path d="M6.6 10.2V19h10.8v-8.8" />
                <path d="M10 19v-4.4h4V19" />
              </svg>
              <span>Início</span>
            </button>
            <button
              type="button"
              className="assistente__fechar"
              onClick={() => {
                setAberto(false);
                botao.current?.focus();
              }}
              aria-label="Fechar o assistente"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </header>

        <div className="assistente__conversa" aria-live="polite" ref={conversa}>
          {mensagens.length === 0 && (
            <div className="assistente__inicio">
              <p>
                Respostas a partir dos editais, da programação e das páginas
                oficiais. Não substitui a secretaria do encontro.
              </p>
            </div>
          )}

          {mensagens.map((m, i) => (
            <p
              key={`${m.papel}-${i}`}
              className={`assistente__msg assistente__msg--${m.papel}`}
            >
              <ComLinks texto={m.texto} />
            </p>
          ))}

          {carregando && (
            <p className="assistente__msg assistente__msg--assistente assistente__msg--pensando">
              Consultando as fontes…
            </p>
          )}
        </div>

        {mensagens.length === 0 && (
          <div className="assistente__sugestoes">
            {SUGESTOES[escopo].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => enviar(s)}
                disabled={carregando}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Atalhos fixos: só depois da primeira mensagem, sempre acima do campo. */}
        <div className="assistente__atalhos">
          {mensagens.length > 0 && (
            <div
              className="assistente__topicos"
              role="group"
              aria-label="Perguntas rápidas"
            >
              {TOPICOS_FIXOS.map((topico) => (
                <button
                  key={topico.id}
                  type="button"
                  className="assistente__topico"
                  onClick={() => void enviar(topico.pergunta)}
                  disabled={carregando}
                  title={topico.pergunta}
                  aria-label={`Perguntar sobre ${topico.rotulo}`}
                >
                  {topico.rotulo}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="assistente__mais"
            aria-expanded={maisAberto}
            aria-controls="assistente-perguntas"
            onClick={() => setMaisAberto((v) => !v)}
          >
            {maisAberto ? "Ver menos perguntas" : "Ver mais perguntas"}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={maisAberto ? "is-aberto" : undefined}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <ul
          id="assistente-perguntas"
          className="assistente__perguntas"
          hidden={!maisAberto}
        >
          {TOPICOS.map((topico) => (
            <li key={topico.id}>
              <button
                type="button"
                onClick={() => void enviar(topico.pergunta)}
                disabled={carregando}
              >
                {topico.pergunta}
              </button>
            </li>
          ))}
        </ul>

        <form
          className="assistente__form"
          onSubmit={(e) => {
            e.preventDefault();
            void enviar(texto);
          }}
        >
          <label className="assistente__oculto" htmlFor="assistente-campo">
            Escreva sua pergunta
          </label>
          <textarea
            id="assistente-campo"
            ref={campo}
            value={texto}
            rows={2}
            maxLength={800}
            placeholder="Ex.: como faço a inscrição?"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void enviar(texto);
              }
            }}
          />
          <button
            type="submit"
            className="assistente__enviar"
            disabled={carregando || texto.trim().length === 0}
            aria-label="Enviar pergunta"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>

        <p className="assistente__pe">
          {modoLocal
            ? "Modo local: respostas prontas, sem modelo de IA. "
            : "IA pode errar. Confira nos links oficiais. "}
          <a href="mailto:ipdmscorreio@gmail.com">ipdmscorreio@gmail.com</a>
        </p>
      </section>
    </>
  );
}
