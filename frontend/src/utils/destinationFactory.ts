import { Destination } from "../types";

export type GeoPoint = {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
};

export function makeDestinationFromGeo(
  geo: GeoPoint,
  fallbackName: string
): Destination {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    name: geo.address || geo.name || fallbackName,
    address: "",
    costs: [{ id: `${id}-1`, amount: 0, detail: "" }],
    lat: geo.lat,
    lng: geo.lng,
    latitude: geo.lat,
    longitude: geo.lng,
  };
}
