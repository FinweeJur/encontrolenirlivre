/**
 * Monta a pasta do site do seminário para o Cloudflare Pages.
 *
 * O build do Vite gera duas páginas em `dist/`. Para o projeto
 * `seminariovenasabiertas` o seminário precisa ser a RAIZ, então:
 * - `dist/seminario.html` vira `dist-seminario/index.html`;
 * - `assets`, `img` e `fonts` são copiados (os caminhos são absolutos).
 */
import { cpSync, copyFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const raiz = process.cwd();
const dist = join(raiz, "dist");
const destino = join(raiz, "dist-seminario");

if (!existsSync(join(dist, "seminario.html"))) {
  console.error("Rode `npm run build` antes: dist/seminario.html não existe.");
  process.exit(1);
}

rmSync(destino, { recursive: true, force: true });
cpSync(dist, destino, { recursive: true });

// A raiz do projeto é a página do seminário; o index.html da RENAP sai.
rmSync(join(destino, "index.html"), { force: true });
copyFileSync(join(dist, "seminario.html"), join(destino, "index.html"));
rmSync(join(destino, "seminario.html"), { force: true });

console.log("dist-seminario pronto (seminário como raiz)");
