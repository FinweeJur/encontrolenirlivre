/**
 * Tipos mínimos do D1 para as Pages Functions.
 *
 * O projeto não carrega `@cloudflare/workers-types` (o `tsconfig` inclui
 * `functions`, e o pacote puxaria tipos de runtime inteiros). Aqui ficam só
 * os três métodos que usamos, para o TypeScript conferir sem depender dele.
 */
export interface D1Resultado<T> {
  results: T[];
}

export interface D1Preparada {
  bind(...valores: unknown[]): D1Preparada;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Resultado<T>>;
  run(): Promise<unknown>;
}

export interface D1Banco {
  prepare(sql: string): D1Preparada;
}
