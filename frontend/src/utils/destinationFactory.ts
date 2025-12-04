import { Destination } from "../types";

export type GeoPoint = {
  lat: number;
  lng: number;
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
    latitude: geo.lat,
    longitude: geo.lng,
    lat: geo.lat,
    lng: geo.lng,
  };
}