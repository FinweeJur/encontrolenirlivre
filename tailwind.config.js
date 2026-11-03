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
    extend: {
      // Paleta semântica usada pelo player de rádio copiado do portal
      // (primary, surface, surface-2, border, text, text-soft). Os valores
      // vivem nos tokens do tema em global.css, em triplete RGB, para o
      // Tailwind conseguir aplicar opacidade (ex.: bg-primary/10).
      colors: {
        primary: "rgb(var(--r-primary) / <alpha-value>)",
        "primary-foreground": "rgb(var(--r-surface) / <alpha-value>)",
        background: "rgb(var(--r-surface) / <alpha-value>)",
        foreground: "rgb(var(--r-text) / <alpha-value>)",
        muted: "rgb(var(--r-surface-2) / <alpha-value>)",
        ring: "rgb(var(--r-primary) / <alpha-value>)",
        surface: "rgb(var(--r-surface) / <alpha-value>)",
        "surface-2": "rgb(var(--r-surface-2) / <alpha-value>)",
        border: "rgb(var(--r-border) / <alpha-value>)",
        text: "rgb(var(--r-text) / <alpha-value>)",
        "text-soft": "rgb(var(--r-text-soft) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
