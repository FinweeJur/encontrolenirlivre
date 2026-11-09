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

## Check-in e presença

O check-in é aberto, sem login, e grava no D1 `encontro-presenca` (binding
`DB`). A página funciona offline: o registro fica no `localStorage` e sobe
sozinho quando a rede volta.

| Endereço | Para quê |
|---|---|
| `/checkin` | registrar presença, já na atividade da hora corrente |
| `/c/<chave>` | link curto do QR; abre `/checkin` na atividade |
| `/painel` | painel com nomes, protegido pela senha `PRESENCA_TOKEN` |
| `/placar` | contagem pública, sem nome nem e-mail |

O schema está em `db/presencas.sql`. Para criar o banco:

```bash
npx wrangler d1 execute encontro-presenca --remote --file db/presencas.sql
npx wrangler pages secret put PRESENCA_TOKEN --project-name encontrolenirlivre
```

O token local fica fora do repositório, em
`%USERPROFILE%\.config\encontrao\presenca-token.txt`.

### Dois celulares na sala

Não é preciso Bluetooth: navegador não fala Bluetooth de celular para celular,
e Wi-Fi Direct também não é exposto à página. O caminho certo é o formulário
enviar direto para o Pages, com a fila offline como rede de segurança.

1. Um dos aparelhos com dados móveis pode abrir um hotspot para os demais.
   O hotspot só empresta internet; os registros continuam indo para o D1.
2. No aparelho da equipe, abra
   `/checkin?s=11-3&recepcao=1` (troque `11-3` pela atividade).
   O modo recepção limpa o formulário depois de cada pessoa e mostra quantos
   registros passaram por ali.
3. No segundo aparelho, deixe `/painel` aberto (senha da comissão) ou
   `/placar` para acompanhar o salão.
4. Ao terminar o turno, toque em **Limpar dados** no modo recepção. Se houver
   registro ainda na fila, a página avisa antes de apagar.

Em aparelho compartilhado, o nome e o e-mail ficam no navegador até o envio.
Não deixe o aparelho destravado fora do turno.

### Avisos no Telegram e no WhatsApp

Dois scripts leem o site e disparam pelo serviço local do OpenMausBot
(`127.0.0.1:8899`, rota `/enviar`). O Telegram usa a API oficial.

- `scripts/avisar-checkin.py`: marcos de 50, 100, 150, 200 e 250 presenças.
- `scripts/avisar-programa.py`: dois avisos por dia, às 07h e às 20h, de 9 a
  14/11. O da manhã traz o resumo do dia; o da noite, o que vem amanhã.

Todo texto passa por `scripts/avisos/revisor.py` antes do envio: concordância,
crase, hora, sala e GD fora da programação bloqueiam a mensagem. Ensaie sem
enviar:

```bash
python scripts/avisar-programa.py --ensaiar
python scripts/avisar-programa.py --status
```

Os `.cmd` em `scripts/` são para o Agendador de Tarefas. Ajuste o grupo do
WhatsApp em `WHATSAPP_GRUPO` (ou o JID em `WHATSAPP_JID`); sem serviço no ar,
a mensagem fica na fila por até duas horas.

## Listas de presença impressas

`python scripts/gerar-listas-presenca.py` gera **um único** `.docx` em
`public/entrega-encontro/`, com os quatro dias em seções separadas. Cada dia
tem cabeçalho próprio, repetido em todas as páginas, com o nome do evento e o
dia da programação.

Cada folha traz:

- as três organizações e as logos (RENAP, IPDMS e RENAJU);
- o nome completo do evento e o resumo do dia, **sem as atividades culturais**;
- 72 linhas com nome, e-mail, rede, manhã, tarde e assinatura;
- o QR da abertura no resumo do dia 11, antes da linha da mesa de abertura.

A marca da RENAJU veio do PDF oficial de trabalhos aprovados do IPDMS e está
em `public/img/renaju-logo.png`. Se a organização enviar outra versão, basta
substituir o arquivo e rodar de novo. A largura das colunas foi medida para
caneta: nome com 6 cm, assinatura com 4,5 cm e linha de 1,05 cm.

A pasta `public/entrega-encontro/` reúne a lista em `.docx` e `.pdf`, os 39
QR em `qrcodes/` e o PDF único dos cartazes. As atividades culturais ficaram
fora dos cartazes e do resumo. Para gerar o PDF da lista:

```bash
python scripts/gerar-listas-presenca.py
soffice --headless --convert-to pdf --outdir public/entrega-encontro public/entrega-encontro/listas-presenca-encontro-2026.docx
```

## Espelho no Google Sheets

A planilha **“Presenças — Encontro 2026”** é criada por
`scripts/criar-planilha.py` e atualizada por `scripts/espelhar-planilha.py`.
O `scripts/espelhar-planilha.cmd` roda a cada 2 minutos pelo Agendador de
Tarefas.

- `presencas`: uma linha por check-in, com quando, dia, hora, atividade,
  sala, rede, nome e e-mail.
- `resumo`: total e contagem por atividade, calculados pelo próprio script.

O token e o ID da planilha ficam em `%USERPROFILE%\.config\encontrao\`; nada
disso entra no repositório. O token do Google vale até 15/11/2026; depois
disso, rode `python scripts/autenticar-google-planilha.py` de novo.

## Grupos de Discussão

A seção “Grupos de Discussão” do seminário (`src/components/seminario/Gds.tsx`)
lê `src/content/gds.ts`, gerado a partir do PDF oficial de trabalhos aprovados
(`Trabalhos-Aprovados-1.pdf`, publicado pela organização). São 12 GDs e 140
títulos. O PDF não lista trabalhos para os GDs 4 e 6 — a página diz isso.

Quando a organização publicar retificação, atualize `gds.ts`; a página e o
assistente leem a mesma lista. Local e horário de cada GD ainda serão
divulgados, e a página marca isso com o selo “Em breve”.

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
