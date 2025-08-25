import {
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultTourValues,
  type Gender
} from '../constants';

export type Client = typeof defaultClientValues & { gender: Gender };
export type Flight = typeof defaultFlightValues;
export type Hotel = typeof defaultHotelValues;
export type Tour = typeof defaultTourValues;
export type Car = typeof defaultCarValues;

export interface ReservationFormData {
  clients: Client[];
  flights: Flight[];
  hotels: Hotel[];
  tours: Tour[];
  cars: Car[];
}

export type BaseRow = {
  id: number;
  reservation_id: number;
  created_at: string;
};

export type ReservationRequest = { main_client_name: string } & ReservationFormData;

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      reservations: {
        Row: {
          id: number;
          reservation_id: string;
          status: string;
          created_at: string;
          main_client_name: string;
          total_amount?: number;
        };
        Insert: {
          id?: number;
          reservation_id: string;
          status?: string;
          created_at?: string;
          main_client_name: string;
          total_amount?: number;
        };
        Update: {
          id?: number;
          reservation_id?: string;
          status?: string;
          created_at?: string;
          main_client_name?: string;
          total_amount?: number;
        };
      };
      clients: {
        Row: BaseRow & Client;
        Insert: Omit<Client, 'id'> & {
          reservation_id: number;
        };
        Update: Partial<Client> & {
          reservation_id?: number;
        };
      };
      flights: {
        Row: BaseRow & Flight;
        Insert: Omit<Flight, 'id'> & {
          reservation_id: number;
          created_at?: string;
        };
        Update: Partial<Flight> & {
          reservation_id?: number;
          created_at?: string;
        };
      };
      hotels: {
        Row: BaseRow & Hotel;
        Insert: Omit<Hotel, 'id'> & {
          reservation_id: number;
          created_at?: string;
        };
        Update: Partial<Hotel> & {
          reservation_id?: number;
          created_at?: string;
        };
      };
      tours: {
        Row: BaseRow & Tour;
        Insert: Omit<Tour, 'id'> & {
          reservation_id: number;
          created_at?: string;
        };
        Update: Partial<Tour> & {
          reservation_id?: number;
          created_at?: string;
        };
      };
      cars: {
        Row: BaseRow & Car;
        Insert: Omit<Car, 'id'> & {
          reservation_id: number;
          created_at?: string;
        };
        Update: Partial<Car> & {
          reservation_id?: number;
          created_at?: string;
        };
      };
    };
    Functions: {
      create_reservation: {
        Args: {
          p_reservation_id: string;
          p_clients: Json;
          p_flights: Json;
          p_main_client_name: string;
          p_hotels?: Json;
          p_tours?: Json;
          p_cars?: Json;
        };
        Returns: Json;
      };
    };
  };
}

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type ReservationRow = TablesRow<'reservations'>;

export interface Reservation {
  id: number;
  reservation_id: string;
  status: string;
  created_at: string;
  main_client_name: string;
  total_amount?: number;
  clients: TablesRow<'clients'>[];
}

export interface ReservationProducts {
  flights: TablesRow<'flights'>[];
  hotels: TablesRow<'hotels'>[];
  tours: TablesRow<'tours'>[];
  rental_cars: TablesRow<'cars'>[];
}

export type ReservationResponse = Reservation & { products: ReservationProducts };

export type ReservationQueryResponse = Reservation & ReservationProducts;

export interface AllProducts {
  id: number;
  reservation_id: string;
  created_at: string;
  event_date: string;
  main_client_name: string;
  product_name: string;
  type: 'flight' | 'hotel' | 'tour' | 'rental_car';
  [key: string]: unknown;
}

export type ProductWithReservation<T> = {
  reservations: {
    main_client_name: string;
  };
} & T;

export interface ReservationUpdateRequest {
  reservation_id: string;
  status?: string;
  main_client_name?: string;
  total_amount?: number;
  clients?: Array<Partial<TablesRow<'clients'>> & { id?: number }>;
  flights?: Array<Partial<TablesRow<'flights'>> & { id?: number }>;
  hotels?: Array<Partial<TablesRow<'hotels'>> & { id?: number }>;
  tours?: Array<Partial<TablesRow<'tours'>> & { id?: number }>;
  cars?: Array<Partial<TablesRow<'cars'>> & { id?: number }>;
}
