import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/**
 * Duas páginas:
 * - index.html     → 30º Encontro Nacional da RENAP (tema kraft escuro)
 * - seminario.html → XI Seminário do IPDMS (terracota sobre papel)
 * Cada uma tem entrada, CSS e identidade próprios; o Cloudflare Pages serve
 * `/` e `/seminario`.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    cssMinify: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        seminario: fileURLToPath(new URL("./seminario.html", import.meta.url)),
      },
    },
  },
});
