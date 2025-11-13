export interface CostItem {
  id: string;
  amount: number;
  detail: string;
}

export interface Destination {
  id: string;
  name: string;
  address: string;
  costs: CostItem[];
  lat: number;
  lng: number;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  destinations: Destination[];
  optimizedRoute: Destination[];
}
