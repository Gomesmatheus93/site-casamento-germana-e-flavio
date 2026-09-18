export const WEDDING = {
  noivos: {
    ele: "Flávio",
    ela: "Germana",
  },
  dataISO: "2026-11-01T16:00:00-03:00",
  dataFormatada: "01 de novembro de 2026",
  horario: "16h",
  cerimonia: {
    nome: "Igreja Sagrado Coração de Jesus",
    endereco: "Rua Jerônimo Rosado, 55-83 - Centro, Mossoró - RN, 59610-060",
    mapsQuery: "Igreja Sagrado Coração de Jesus, Rua Jerônimo Rosado, Centro, Mossoró - RN",
  },
  recepcao: {
    nome: "Thermas Hall",
    endereco: "Av. Lauro Monte, 2001, Mossoró - RN, 59619-000",
    mapsQuery: "Thermas Hall, Av. Lauro Monte, Mossoró - RN",
  },
};

// Data em que o álbum de fotos dos convidados é liberado para upload/visualização pública.
export const PHOTOS_UNLOCK_DATE = WEDDING.dataISO;

export const CATEGORIAS_PRESENTE = [
  "Cozinha",
  "Quarto",
  "Sala",
  "Casa & Decoração",
  "Eletrodomésticos",
  "Lua de mel",
  "Outros",
] as const;

export const LOGISTICA = {
  resumo:
    "Mossoró fica no interior do Rio Grande do Norte, entre as capitais Natal (RN) e Fortaleza (CE), com boa estrutura de rodovias e um aeroporto regional que recebe voos domésticos.",
  distancias: [
    {
      cidade: "Natal - RN",
      distanciaEstrada: "≈ 278 km",
      tempoCarro: "≈ 4h de carro",
      obs: "Capital do estado. Aeroporto Internacional de Natal - Governador Aluízio Alves (NAT) recebe voos diretos de várias capitais.",
    },
    {
      cidade: "Fortaleza - CE",
      distanciaEstrada: "≈ 250 km",
      tempoCarro: "≈ 3h30 de carro",
      obs: "Aeroporto Internacional Pinto Martins (FOR) tem mais opções de voos e costuma ter passagens mais baratas.",
    },
  ],
  aeroportoLocal: {
    nome: "Aeroporto de Mossoró - Dix-Sept Rosado (MVF)",
    obs: "Aeroporto regional na própria cidade; verifique a disponibilidade de voos com antecedência, pois a malha aérea é mais limitada que Natal e Fortaleza.",
  },
  comoChegar: [
    "De avião até Natal (NAT) ou Fortaleza (CE) e depois ônibus/carro/aplicativo até Mossoró (~3h30 a 4h de estrada).",
    "De avião direto até Mossoró (MVF), quando houver voos disponíveis para a data.",
    "De carro pela BR-304 (saindo de Natal) ou BR-222/BR-304 (saindo de Fortaleza).",
    "Ônibus rodoviário: há linhas regulares saindo de Natal e Fortaleza até a Rodoviária de Mossoró.",
  ],
};

export type Salao = {
  nome: string;
  endereco: string;
  mapsQuery: string;
  destaque: string;
  instagramUrl?: string;
};

export const SALOES: Salao[] = [
  {
    nome: "Vanessa Marinho Beauty Studio",
    endereco: "Rua Gilberto Marcelino Sobrinho, 27 - Nova Betânia, Mossoró - RN",
    mapsQuery:
      "Vanessa Marinho Beauty Studio, Rua Gilberto Marcelino Sobrinho, 27, Nova Betânia, Mossoró - RN",
    destaque:
      "Sugestão para as convidadas se arrumarem antes da festa: cabelo, maquiagem e estética.",
    instagramUrl: "https://www.instagram.com/vanessamarinhobeautystudio/",
  },
];

export type Hotel = {
  nome: string;
  categoria: string;
  distanciaCentro: string;
  destaque: string;
  bookingUrl: string;
};

// Link direto para a página do hotel no Booking.com, já com as datas do
// casamento preenchidas (check-in na véspera, check-out no dia seguinte),
// para o convidado sempre ver a disponibilidade e o preço atuais.
function bookingUrl(slug: string) {
  return `https://www.booking.com/hotel/br/${slug}.html?checkin=2026-10-31&checkout=2026-11-02&group_adults=2&no_rooms=1&group_children=0`;
}

export const HOTEIS: Hotel[] = [
  {
    nome: "Garbos Trade Hotel",
    categoria: "4 estrelas",
    distanciaCentro: "≈ 3 km do centro",
    destaque: "Piscina externa aquecida, academia, sauna e restaurante à la carte.",
    bookingUrl: bookingUrl("garbos"),
  },
  {
    nome: "Vitória Palace Hotel",
    categoria: "Conforto",
    distanciaCentro: "≈ 5 km do centro",
    destaque: "Piscina aquecida, sauna e café da manhã com especialidades regionais.",
    bookingUrl: bookingUrl("vitoria-palace-mossoro"),
  },
  {
    nome: "Ibis Mossoró",
    categoria: "Econômico/rede internacional",
    distanciaCentro: "Próximo ao centro",
    destaque: "Rede conhecida pela relação custo-benefício e praticidade.",
    bookingUrl: bookingUrl("ibis-mossora3"),
  },
  {
    nome: "Hotel Conterrâneo",
    categoria: "4 estrelas",
    distanciaCentro: "≈ 2,4 km do centro",
    destaque: "Piscina, café da manhã grátis e Wi-Fi gratuito, com vista para o jardim.",
    bookingUrl: bookingUrl("conterraneo"),
  },
  {
    nome: "Thermas Hotel Mossoró",
    categoria: "Lazer/família",
    distanciaCentro: "Zona sul",
    destaque: "Parque aquático e espaço kids, boa opção para quem viaja com crianças.",
    bookingUrl: bookingUrl("thermas-resort"),
  },
  {
    nome: "Hotel VillaOeste",
    categoria: "4 estrelas",
    distanciaCentro: "≈ 1,2 km do centro",
    destaque:
      "Área verde de 50 mil m² com spa, piscina externa com deck de madeira e café da manhã com frutas tropicais.",
    bookingUrl: bookingUrl("villaoeste"),
  },
];

export type Restaurante = {
  nome: string;
  tipo: string;
  local: string;
  destaque: string;
};

export const RESTAURANTES: Restaurante[] = [
  {
    nome: "Tábua de Carne",
    tipo: "Carnes & pratos regionais",
    local: "Partage Shopping Mossoró",
    destaque: "Um dos favoritos da cidade para carnes nobres e culinária regional.",
  },
  {
    nome: "Trattoria",
    tipo: "Cozinha italiana",
    local: "Nova Betânia",
    destaque: "Massas artesanais, risotos e carnes com toque italiano autêntico.",
  },
  {
    nome: "Pinga Fogo",
    tipo: "Churrascaria",
    local: "Zona central",
    destaque: "Ambiente espaçoso, ótimo para grupos e famílias.",
  },
  {
    nome: "Villa Gourmet",
    tipo: "Sanduíches & sushi",
    local: "Zona central",
    destaque: "Ambiente descontraído e instagramável, opções variadas.",
  },
  {
    nome: "Tchê Gourmet",
    tipo: "Rodízio gaúcho",
    local: "Nova Betânia",
    destaque: "Rodízio diário com o famoso churrasco gaúcho e buffet variado.",
  },
  {
    nome: "Forneria Casa Paulista",
    tipo: "Pizzaria artesanal",
    local: "Nova Betânia",
    destaque: "Pizzas artesanais, focaccia e burrata em ambiente aconchegante.",
  },
];
