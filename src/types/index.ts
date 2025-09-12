import {
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultInsuranceValues,
  defaultTourValues,
  ProductStatus
} from '../constants';

export type Client = typeof defaultClientValues;
export type Flight = typeof defaultFlightValues;
export type Hotel = typeof defaultHotelValues;
export type Tour = typeof defaultTourValues;
export type Car = typeof defaultCarValues;
export type Insurance = typeof defaultInsuranceValues;

export interface AllProducts {
  id: number;
  reservation_id: string;
  created_at: string;
  event_date: string;
  booking_platform: string;
  main_client_name: string;
  status: keyof typeof ProductStatus;
  product_name: string;
  type: ProductType;
  total_amount: number;
  total_cost: number;
  exchange_rate: number;
  [key: string]: unknown;
}

export type ProductType = 'flight' | 'hotel' | 'tour' | 'rental_car';

export interface UpdateProductStatusParams {
  reservation_id: string;
  product_type: ProductType;
  product_id: number;
  status: ProductStatus;
}

export type BaseRow = {
  id: number;
  reservation_id: number;
  created_at: string;
};

export interface ReservationItem {
  clients: Client[];
  flights: Flight[];
  hotels: Hotel[];
  tours: Tour[];
  rental_cars: Car[];
  insurances: Insurance[];
}

export interface ReservationBaseInfo {
  exchange_rate: number;
  booking_platform: string;
  main_client_name: string;
  total_amount: number;
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableSchema<TRow, TInsert = Omit<TRow, 'id'>, TUpdate = Partial<TRow>> = {
  Row: TRow;
  Insert: TInsert;
  Update: TUpdate;
};

export type ReservationFormData = ReservationBaseInfo & ReservationItem;

export interface ReservationBaseInfo {
  exchange_rate: number;
  booking_platform: string;
  main_client_name: string;
  total_amount: number;
}

export type ReservationRequest = ReservationFormData;

export interface Database {
  public: {
    Tables: {
      reservations: TableSchema<
        {
          id: number;
          reservation_id: string;
          status: string;
          created_at: string;
          main_client_name: string;
          total_amount?: number;
        },
        {
          id?: number;
          reservation_id: string;
          status?: string;
          created_at?: string;
          main_client_name: string;
          total_amount?: number;
        }
      >;
      clients: TableSchema<
        BaseRow & Client,
        Omit<Client, 'id'> & { reservation_id: number },
        Partial<Client> & { reservation_id?: number }
      >;
      flights: TableSchema<
        BaseRow & Flight,
        Omit<Flight, 'id'> & { reservation_id: number; created_at?: string },
        Partial<Flight> & { reservation_id?: number; created_at?: string }
      >;
      hotels: TableSchema<
        BaseRow & Hotel,
        Omit<Hotel, 'id'> & { reservation_id: number; created_at?: string },
        Partial<Hotel> & { reservation_id?: number; created_at?: string }
      >;
      tours: TableSchema<
        BaseRow & Tour,
        Omit<Tour, 'id'> & { reservation_id: number; created_at?: string },
        Partial<Tour> & { reservation_id?: number; created_at?: string }
      >;
      rental_cars: TableSchema<
        BaseRow & Car,
        Omit<Car, 'id'> & { reservation_id: number; created_at?: string },
        Partial<Car> & { reservation_id?: number; created_at?: string }
      >;
      insurances: TableSchema<
        BaseRow & Insurance,
        Omit<Insurance, 'id'> & { reservation_id: number; created_at?: string },
        Partial<Insurance> & { reservation_id?: number; created_at?: string }
      >;
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

export interface Reservation extends ReservationBaseInfo {
  id: number;
  reservation_id: string;
  status: ProductStatus;
  created_at: string;
  clients: TablesRow<'clients'>[];
}

export interface ReservationProducts {
  flights: TablesRow<'flights'>[];
  hotels: TablesRow<'hotels'>[];
  tours: TablesRow<'tours'>[];
  rental_cars: TablesRow<'rental_cars'>[];
  insurances: TablesRow<'insurances'>[];
}

export type ReservationResponse = Reservation & { products: ReservationProducts };

export type ReservationQueryResponse = Reservation & ReservationProducts;

export type ProductWithReservation<T> = T & {
  reservations: {
    main_client_name: string;
    booking_platform: string;
  };
};

type PartialProductWithId<T> = Array<Partial<T> & { id?: number }>;

export interface ReservationUpdateRequest {
  reservation_id: string;
  exchange_rate: number;
  status?: string;
  main_client_name?: string;
  total_amount?: number;
  clients?: PartialProductWithId<TablesRow<'clients'>>;
  flights?: PartialProductWithId<TablesRow<'flights'>>;
  hotels?: PartialProductWithId<TablesRow<'hotels'>>;
  tours?: PartialProductWithId<TablesRow<'tours'>>;
  rental_cars?: PartialProductWithId<TablesRow<'rental_cars'>>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export type ProductFormType = keyof ReservationItem;
