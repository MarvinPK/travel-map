export type TravelPhoto = {
  id: string;
  url: string;
  caption?: string;
  location?: string;
};

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

  photos?: TravelPhoto[];

  locations?: TravelLocation[];
};