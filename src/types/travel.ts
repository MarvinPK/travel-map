export type TravelLocation = {
  name: string;
  description?: string;
};

export type TravelCountry = {
  countryCode: string;

  name: string;

  flag: string;

  continent: string;

  year: number;

  description: string;

  coverImage?: string;

  locations?: TravelLocation[];
};