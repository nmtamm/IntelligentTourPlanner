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
  longitude: number;
  latitude: number;
}

export interface RouteInstruction {
  type: string;
  modifier: string;
  name: string;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  destinations: Destination[];
  optimizedRoute: Destination[];
  routeDistanceKm?: number;
  routeDurationMin?: number;
  routeGeometry?: string;
  routeInstructions?: RouteInstruction[][];
  routeSegmentGeometries?: string[];
}

