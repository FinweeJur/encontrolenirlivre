/**
 * Fotos do XXX Encontro Nacional da RENAP, em João Pessoa (11 a 14/11/2026).
 *
 * Fonte: acervo da organização — 43 fotos da pasta do encontro e uma amostra
 * do ZIP "Abertura OAB PB". Reduzidas para 900 px e convertidas em WebP por
 * `scripts/preparar-fotos-encontro.mjs`.
 *
 * A lista é gerada por `scripts/gerar-lista-fotos.mjs`: não editar à mão.
 */
export const fotosEncontro: string[] = [
  "/img/encontro-2026/encontro-01.webp",
  "/img/encontro-2026/encontro-02.webp",
  "/img/encontro-2026/encontro-06.webp",
  "/img/encontro-2026/encontro-07.webp",
  "/img/encontro-2026/encontro-08.webp",
  "/img/encontro-2026/encontro-09.webp",
  "/img/encontro-2026/encontro-10.webp",
  "/img/encontro-2026/encontro-11.webp",
  "/img/encontro-2026/encontro-12.webp",
  "/img/encontro-2026/encontro-13.webp",
  "/img/encontro-2026/encontro-14.webp",
  "/img/encontro-2026/encontro-15.webp",
  "/img/encontro-2026/encontro-16.webp",
  "/img/encontro-2026/encontro-17.webp",
  "/img/encontro-2026/encontro-18.webp",
  "/img/encontro-2026/encontro-19.webp",
  "/img/encontro-2026/encontro-20.webp",
  "/img/encontro-2026/encontro-21.webp",
  "/img/encontro-2026/encontro-22.webp",
  "/img/encontro-2026/encontro-23.webp",
  "/img/encontro-2026/encontro-24.webp",
  "/img/encontro-2026/encontro-25.webp",
  "/img/encontro-2026/encontro-26.webp",
  "/img/encontro-2026/encontro-27.webp",
  "/img/encontro-2026/encontro-28.webp",
  "/img/encontro-2026/encontro-29.webp",
  "/img/encontro-2026/encontro-30.webp",
  "/img/encontro-2026/encontro-31.webp",
  "/img/encontro-2026/encontro-32.webp",
  "/img/encontro-2026/encontro-33.webp",
  "/img/encontro-2026/encontro-34.webp",
  "/img/encontro-2026/encontro-35.webp",
  "/img/encontro-2026/encontro-36.webp",
  "/img/encontro-2026/encontro-37.webp",
  "/img/encontro-2026/encontro-38.webp",
  "/img/encontro-2026/encontro-39.webp",
  "/img/encontro-2026/encontro-40.webp",
  "/img/encontro-2026/encontro-41.webp",
  "/img/encontro-2026/encontro-42.webp",
  "/img/encontro-2026/encontro-43.webp",
  "/img/encontro-2026/encontro-44.webp",
  "/img/encontro-2026/encontro-45.webp",
  "/img/encontro-2026/encontro-46.webp",
  "/img/encontro-2026/encontro-47.webp",
  "/img/encontro-2026/encontro-48.webp",
  "/img/encontro-2026/encontro-49.webp",
  "/img/encontro-2026/encontro-50.webp",
  "/img/encontro-2026/encontro-51.webp",
  "/img/encontro-2026/encontro-52.webp",
  "/img/encontro-2026/encontro-53.webp",
  "/img/encontro-2026/encontro-54.webp",
  "/img/encontro-2026/encontro-55.webp",
  "/img/encontro-2026/encontro-56.webp",
  "/img/encontro-2026/encontro-57.webp",
  "/img/encontro-2026/encontro-58.webp",
  "/img/encontro-2026/encontro-59.webp",
  "/img/encontro-2026/encontro-60.webp",
  "/img/encontro-2026/encontro-61.webp",
  "/img/encontro-2026/encontro-62.webp",
  "/img/encontro-2026/encontro-63.webp",
  "/img/encontro-2026/encontro-64.webp",
  "/img/encontro-2026/encontro-65.webp",
  "/img/encontro-2026/encontro-66.webp",
  "/img/encontro-2026/encontro-67.webp",
  "/img/encontro-2026/encontro-68.webp",
  "/img/encontro-2026/encontro-69.webp",
  "/img/encontro-2026/encontro-70.webp",
  "/img/encontro-2026/encontro-71.webp",
  "/img/encontro-2026/encontro-72.webp",
  "/img/encontro-2026/encontro-73.webp",
  "/img/encontro-2026/encontro-74.webp",
  "/img/encontro-2026/encontro-75.webp",
  "/img/encontro-2026/encontro-76.webp",
  "/img/encontro-2026/encontro-77.webp",
  "/img/encontro-2026/encontro-78.webp",
  "/img/encontro-2026/encontro-79.webp",
  "/img/encontro-2026/encontro-80.webp",
  "/img/encontro-2026/encontro-81.webp",
];

/** Divide em N faixas, sem repetir foto dentro da mesma faixa. */
export function faixasDeFotos(quantidade: number): string[][] {
  const faixas: string[][] = Array.from({ length: quantidade }, () => []);
  fotosEncontro.forEach((foto, indice) => {
    faixas[indice % quantidade].push(foto);
  });
  return faixas;
}
