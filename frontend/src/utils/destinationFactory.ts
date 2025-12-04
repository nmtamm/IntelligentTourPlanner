import { Destination } from "../types";

export type GeoPoint = {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
};

export function makeDestinationFromGeo(geo: any, name: string, currency: 'USD' | 'VND'): Destination {
  return {
    id: Date.now().toString(),
    name: geo.address || name,
    address: '',
    costs: [
      {
        id: `${Date.now()}-1`,
        amount: "",
        detail: '',
        originalAmount: "",
        originalCurrency: currency,
      }
    ],
    latitude: geo.latitude,
    longitude: geo.longitude,
  };
}