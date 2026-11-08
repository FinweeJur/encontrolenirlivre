/**
 * Exporta a programação como JSON público.
 *
 * A página e o app de produção precisam do mesmo horário, da mesma sala e da
 * mesma etiqueta. Este script lê a fonte TypeScript e escreve
 * `public/dados/programacao.json` — um contrato só, sem duplicar dado.
 *
 * Rodado no `npm run build`, antes do Vite copiar `public/`.
 */
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { Buffer } from "node:buffer";

const SAIDA = "public/dados/programacao.json";

const resultado = await build({
  entryPoints: ["src/content/programacaoDetalhada.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  write: false,
  logLevel: "silent",
});

const codigo = resultado.outputFiles[0].text;
const modulo = await import(
  "data:text/javascript;base64," + Buffer.from(codigo).toString("base64")
);

const dias = modulo.programaDetalhado;

if (!Array.isArray(dias) || dias.length === 0) {
  throw new Error("programacaoDetalhada não exportou dias");
}

const dados = {
  fonte: "https://encontrolenirlivre.pages.dev/dados/programacao.json",
  geradoEm: new Date().toISOString().slice(0, 10),
  evento: {
    nome: "30º Encontro Nacional da RENAP — Lenir Correia Livre",
    juntoCom: [
      "XI Seminário Nacional do IPDMS — Venas abiertas",
      "20º Encontro Nacional da RENAJU — Memórias e dilemas renajupianos",
    ],
    inicio: "2026-11-11",
    fim: "2026-11-14",
    local: "Universidade Federal da Paraíba, Campus I",
    endereco: "Cidade Universitária, s/n, Castelo Branco, João Pessoa/PB",
  },
  dias: dias.map((dia) => ({
    dia: dia.dia,
    semana: dia.semana,
    data: `2026-11-${String(dia.dia).padStart(2, "0")}`,
    atividades: dia.itens.map((item) => ({
      hora: item.hora,
      titulo: item.titulo,
      local: item.local ?? null,
      organizacao: item.tag,
      periodo: item.periodo,
    })),
  })),
};

mkdirSync("public/dados", { recursive: true });
writeFileSync(SAIDA, JSON.stringify(dados, null, 2), "utf8");

const total = dados.dias.reduce((soma, d) => soma + d.atividades.length, 0);
console.log(`programacao.json: ${dados.dias.length} dias, ${total} atividades → ${SAIDA}`);
