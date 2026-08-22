import type { TravelCountry } from "../types/travel";

const mockVisitedCountries: TravelCountry[] = [
  {
    countryCode: "MAR",
    name: "Maroc",
    flag: "🇲🇦",
    continent: "Afrique",
    year: 2024,
    description:
      "Un voyage entre médinas, montagnes, désert et océan, à la découverte des paysages et de la culture marocaine.",
  },

  {
    countryCode: "GBR",
    name: "Angleterre",
    flag: "🇬🇧",
    continent: "Europe",
    year: 2024,
    description:
      "À la découverte de Londres, des paysages anglais et de l'atmosphère si particulière du Royaume-Uni.",
  },

  {
    countryCode: "ESP",
    name: "Espagne",
    flag: "🇪🇸",
    continent: "Europe",
    year: 2024,
    description:
      "Un voyage entre villes historiques, soleil méditerranéen, gastronomie et paysages espagnols.",
  },

  {
    countryCode: "PRT",
    name: "Portugal",
    flag: "🇵🇹",
    continent: "Europe",
    year: 2024,
    description:
      "Entre Lisbonne, les côtes sauvages et les villages portugais, une découverte pleine de couleurs et de caractère.",
  },

  {
    countryCode: "ISL",
    name: "Islande",
    flag: "🇮🇸",
    continent: "Europe",
    year: 2023,
    description:
      "Un voyage au cœur des volcans, glaciers, cascades et paysages sauvages de l'Islande.",
  },

  {
    countryCode: "SYC",
    name: "Seychelles",
    flag: "🇸🇨",
    continent: "Afrique",
    year: 2024,
    description:
      "Des îles paradisiaques, des plages sauvages, une eau turquoise et des fonds marins exceptionnels.",
  },

  {
    countryCode: "QAT",
    name: "Qatar",
    flag: "🇶🇦",
    continent: "Asie",
    year: 2024,
    description:
      "Un voyage entre modernité, désert et culture au cœur de la péninsule arabique.",
  },

  {
    countryCode: "TUR",
    name: "Turquie",
    flag: "🇹🇷",
    continent: "Asie",
    year: 2024,
    description:
      "Entre Istanbul, les paysages méditerranéens et les vestiges historiques, un pays à cheval entre deux continents.",
  },

  {
    countryCode: "ITA",
    name: "Italie",
    flag: "🇮🇹",
    continent: "Europe",
    year: 2024,
    description:
      "Un voyage à travers les villes historiques, les paysages méditerranéens et la gastronomie italienne.",
  },

  {
    countryCode: "DEU",
    name: "Allemagne",
    flag: "🇩🇪",
    continent: "Europe",
    year: 2024,
    description:
      "À la découverte des villes, paysages et traditions allemandes.",
  },

  {
    countryCode: "BEL",
    name: "Belgique",
    flag: "🇧🇪",
    continent: "Europe",
    year: 2024,
    description:
      "Un voyage entre villes historiques, architecture, gastronomie et culture belge.",
  },

  {
    countryCode: "NLD",
    name: "Pays-Bas",
    flag: "🇳🇱",
    continent: "Europe",
    year: 2024,
    description:
      "Entre canaux, vélos, architecture et paysages de campagne, découverte des Pays-Bas.",
  },

  {
    countryCode: "CRI",
    name: "Costa Rica",
    flag: "🇨🇷",
    continent: "Amérique du Nord",
    year: 2024,
    description:
      "Une immersion dans une nature exceptionnelle entre jungle tropicale, volcans, plages et animaux sauvages.",
  },

  {
    countryCode: "HUN",
    name: "Hongrie",
    flag: "🇭🇺",
    continent: "Europe",
    year: 2024,
    description:
      "Découverte de Budapest, de son architecture, de ses bains thermaux et de la culture hongroise.",
  },

  {
    countryCode: "GRC",
    name: "Grèce",
    flag: "🇬🇷",
    continent: "Europe",
    year: 2024,
    description:
      "Entre îles grecques, eaux turquoise, villages blancs et vestiges antiques.",
  },
];

export async function getVisitedCountries(): Promise<TravelCountry[]> {
  // Simulation d'un appel HTTP.
  // Plus tard, cette fonction appellera ton backend Spring Boot.
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockVisitedCountries;
}
