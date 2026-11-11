/**
 * Locais do encontro e o link de mapa de cada um.
 *
 * A programação traz o nome da sala ("Sala C CCSA"). Este arquivo traduz esse
 * nome para um lugar que o mapa entende, sem inventar coordenada: a busca vai
 * por nome do prédio e cidade.
 *
 * Mapa: OpenStreetMap, que é aberto e não pede chave de API. O Google Maps
 * aparece como alternativa no title do link, para quem preferir.
 */

export type Local = {
  /** Trecho que aparece na programação, para casar por texto. */
  chave: string;
  /** Nome que vai na busca do mapa. */
  busca: string;
  /** Rótulo curto para leitor de tela. */
  rotulo: string;
  /** Tipo, para escolher o ícone. */
  tipo: "predio" | "auditorio" | "cultural" | "rua";
};

const LOCAIS: Local[] = [
  {
    chave: "PPGCJ",
    busca: "Programa de Pós-Graduação em Ciências Jurídicas, UFPB, João Pessoa",
    rotulo: "PPGCJ, CCJ",
    tipo: "predio",
  },
  {
    chave: "CCJ",
    busca: "Centro de Ciências Jurídicas, UFPB, João Pessoa",
    rotulo: "CCJ",
    tipo: "predio",
  },
  {
    chave: "CCSA",
    busca: "Centro de Ciências Sociais Aplicadas, UFPB, João Pessoa",
    rotulo: "CCSA",
    tipo: "predio",
  },
  {
    chave: "CCHLA",
    busca: "Centro de Ciências Humanas Letras e Artes, UFPB, João Pessoa",
    rotulo: "CCHLA",
    tipo: "auditorio",
  },
  {
    chave: "Auditório do CT",
    busca: "Auditório do Centro de Tecnologia, UFPB, João Pessoa",
    rotulo: "Auditório do CT",
    tipo: "auditorio",
  },
  {
    chave: "Armazém do Campo",
    busca: "Armazém do Campo, João Pessoa",
    rotulo: "Armazém do Campo",
    tipo: "cultural",
  },
  {
    chave: "OAB",
    busca: "OAB Paraíba, Rua João Cirilo da Silva 444, Altiplano, João Pessoa",
    rotulo: "Nova sede da OAB/PB (Altiplano)",
    tipo: "predio",
  },
  {
    chave: "Tambaú",
    busca: "Busto de Tamandaré, Praia de Tambaú, João Pessoa",
    rotulo: "Busto de Tamandaré, Tambaú",
    tipo: "cultural",
  },
  {
    chave: "General Osório",
    busca: "Avenida General Osório, Centro, João Pessoa",
    rotulo: "Av. General Osório (Centro)",
    tipo: "cultural",
  },
  {
    chave: "Caravela",
    busca: "Centro Cultural Caravela, João Pessoa",
    rotulo: "Centro Cultural Caravela",
    tipo: "cultural",
  },
  {
    chave: "Cachaçaria",
    busca: "Beco da Cachaçaria, Centro, João Pessoa",
    rotulo: "Beco da Cachaçaria",
    tipo: "cultural",
  },
  {
    chave: "Cléa",
    // Não há registro público deste bar no OpenStreetMap nem nos buscadores.
    // A rota cultural do sábado é no Centro Histórico, ao lado do Sabadinho
    // Bom e do Beco da Cachaçaria: o pino leva para a região, não para um
    // número inventado.
    busca: "Centro Histórico, João Pessoa",
    rotulo: "Centro Histórico (rota cultural)",
    tipo: "cultural",
  },
  {
    chave: "Sabadinho Bom",
    busca: "Sabadinho Bom, Centro, João Pessoa",
    rotulo: "Sabadinho Bom",
    tipo: "cultural",
  },
];

/** Acha o local pelo texto da programação, do mais específico ao mais geral. */
export function acharLocal(texto: string): Local | null {
  const alvo = texto.toLowerCase();
  for (const local of LOCAIS) {
    if (alvo.includes(local.chave.toLowerCase())) return local;
  }
  return null;
}

const codificar = (t: string) => encodeURIComponent(t);

/** OpenStreetMap: busca aberta, sem chave. */
export function linkOpenStreetMap(local: Local): string {
  return `https://www.openstreetmap.org/search?query=${codificar(local.busca)}`;
}

/** Google Maps: alternativa para quem prefere. */
export function linkGoogleMaps(local: Local): string {
  return `https://www.google.com/maps/search/?api=1&query=${codificar(local.busca)}`;
}

/** Lat/long não são inventados: quando não há coordenada, o mapa busca o nome. */
export function localDoTexto(texto: string): Local | null {
  return acharLocal(texto);
}
