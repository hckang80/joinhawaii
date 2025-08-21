import {
  defaultCarValues,
  defaultClientValues,
  defaultFlightValues,
  defaultHotelValues,
  defaultTourValues
} from '../constants';

export type Client = typeof defaultClientValues;
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

export type ReservationRequest = { mainClientName: string } & ReservationFormData;
