# 30º Encontro Nacional da RENAP — Lenir Correia Livre

Site de mobilização do encontro (11 a 14/11/2026, UFPB, João Pessoa/PB),
feito junto ao XI Seminário do IPDMS e ao 20º Encontro da RENAJU.

No ar: **https://encontrolenirlivre.pages.dev**

## Stack

- Vite + React + TypeScript, saída estática (`dist`).
- Cloudflare Pages (deploy manual com `wrangler`).
- Tailwind **só** nos componentes oficiais do Lightswind; o desenho do site
  está em `src/styles/global.css`.
- Fontes em `public/fonts`: Clash Display, General Sans e Tabular (Fontshare).

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173 (ou --port 4321)
npm run build
npm run preview
```

## Assistente (GLM-4-Flash)

A bolha no canto inferior esquerdo abre o assistente das duas páginas. Ele
manda a conversa para `POST /api/chat`, uma Cloudflare Pages Function em
`functions/api/chat.ts`. A função guarda a chave do Zhipu AI como segredo do
projeto e usa a base de `src/content/assistente.ts` (montada a partir de
`evento.ts` e `editais.ts`).

Ligar o modelo em cada projeto (a chave não vai para o repositório):

```bash
npx wrangler pages secret put ZHIPU_API_KEY --project-name encontrolenirlivre
npx wrangler pages secret put ZHIPU_API_KEY --project-name seminariovenasabiertas
```

Conferir se está ligado: `GET /api/chat` responde `{"ligado":true}`. Sem a
chave, o site cai no **modo local**: respostas prontas, com o aviso de que não
há modelo. O endpoint limita 12 perguntas por minuto por IP, recusa origem
diferente e não registra pergunta, resposta nem chave.

## Publicar

```bash
npm run build
npx wrangler pages deploy dist --project-name encontrolenirlivre --branch main
```

O `wrangler` precisa de Node 22 no PATH. Deploy é manual: `git push` não
publica.

## Componentes de terceiros

- **React Bits** — `DitherVeil` e `ElectricLogo` (TypeScript + CSS).
- **Lightswind** — `ElectroBorder`, `Lens`, `Infinite Drift 2` e
  `ExpandableSpeedDial`, copiados do registry oficial (`/r/<nome>.json`).
- `layout-grid`, `scroll-star-effect` e `expandable-search` respondem 401 no
  registry (sem código público): foram reimplementados e estão marcados como
  tal no código.
- Correção local no `Lens`: o Chrome ignora `radial-gradient(circle 95px at …)`;
  o mask passou a usar dois raios explícitos.

## Rádio

O player é cópia adaptada de
`controle-popular/apps/web/app/components/PlayerRadio.tsx`, com as 52 estações
de `lib/radio/estacoes.ts` do portal. HLS (`hls.js`) entra sob demanda, só
quando a emissora escolhida é HLS. Funciona em site estático: o áudio vem do
stream público de cada emissora, sem servidor nosso.

## Pendências editoriais (confirmar antes de divulgar como oficial)

- Quem valida os dois parágrafos sobre a Lenir.
- Se o site é oficial da RENAP ou peça de mobilização.
- Link público do formulário (o token `edit2` do Google Forms não entra).
- `@renapbrasil` vs `@renap.oficial`.
- Domínio final.
