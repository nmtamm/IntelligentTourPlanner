export interface CostItem {
  id: string;
  amount: string;
  detail: string;
  originalAmount: string; // always store the initial input
  originalCurrency: 'USD' | 'VND'; // always store the initial currency
}

export interface Destination {
  id: string;
  name: string;
  address: string;
  costs: CostItem[];
  lat: number;
  lng: number;
  longitude: number;
  latitude: number;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  destinations: Destination[];
  optimizedRoute: Destination[];
  routeDistanceKm?: number;
  routeDurationMin?: number;
  routeGeometry?: string;
  routeInstructions?: string[][];
  routeSegmentGeometries?: string[];
}

