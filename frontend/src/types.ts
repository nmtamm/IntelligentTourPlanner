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

export interface Place {
  id: number;
  position?: number;
  title?: string;
  place_id?: string;
  data_id?: string;
  data_cid?: string;
  reviews_link?: string;
  photos_link?: string;
  gps_coordinates?: any; // You can define a more specific type if known
  place_id_search?: string;
  provider_id?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  type?: string;
  types?: any; // Array or object, specify if known
  type_id?: string;
  type_ids?: any; // Array or object, specify if known
  address?: string;
  open_state?: string;
  hours?: string;
  operating_hours?: any; // Specify type if known
  phone?: string;
  website?: string;
  amenities?: any; // Specify type if known
  description?: string;
  service_options?: any; // Specify type if known
  thumbnail?: string;
  extensions?: any; // Specify type if known
  unsupported_extensions?: any; // Specify type if known
  serpapi_thumbnail?: string;
  user_review?: string;
  place_detail?: Record<string, string>; // Assuming it's an object with string keys/values
  city_name?: string;
  POI_score?: number;
  en_names?: any; // Specify type if known
  vi_names?: any; // Specify type if known
  best_type_id_en?: string;
  best_type_id_vi?: string;
  place_detail_en?: Record<string, string>; // Assuming it's an object with string keys/values
  place_detail_vi?: Record<string, string>; // Assuming it's an object with string keys/values
}