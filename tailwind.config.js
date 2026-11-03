/** @type {import('tailwindcss').Config} */
// Tailwind só existe aqui para os componentes oficiais do Lightswind
// (ElectroBorder, Lens e Infinite Drift 2), que vêm com classes utilitárias.
// O desenho do site é feito em src/styles/global.css; o preflight fica desligado
// para o Tailwind não reescrever a base.
export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  corePlugins: {
    preflight: false,
  },
  safelist: [
    { pattern: /^rounded-(none|sm|md|lg|xl|2xl|3xl|full)$/ },
    { pattern: /^border-[0-9]$/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
