import type { selectTriggerPropDefs } from '@radix-ui/themes/components/select.props';
import { ProductStatus } from '../types';

export const GENDER_TYPE = ['Mr.', 'Ms.', 'Mrs.', 'Miss'] as const;
export type Gender = (typeof GENDER_TYPE)[number] | (string & {});

export const defaultClientValues = {
  korean_name: '',
  english_name: '',
  gender: '',
  resident_id: '',
  phone_number: '',
  email: '',
  notes: ''
};

export const defaultFlightValues = {
  flight_number: '',
  departure_datetime: '',
  departure_city: '',
  arrival_datetime: '',
  arrival_city: '',
  adult_count: 1,
  children_count: 0,
  adult_price: 0,
  children_price: 0,
  adult_cost: 0,
  children_cost: 0,
  total_amount: 0,
  total_cost: 0,
  notes: ''
};

export const defaultHotelValues = {
  region: '',
  check_in_date: '',
  check_out_date: '',
  hotel_name: '',
  room_type: '',
  is_breakfast_included: false,
  is_resort_fee: false,
  nights: 1,
  nightly_rate: 0,
  total_amount: 0,
  total_cost: 0,
  cost: 0,
  notes: ''
};

export const defaultTourValues = {
  region: '',
  start_date: '',
  end_date: '',
  name: '',
  adult_count: 1,
  children_count: 0,
  adult_price: 0,
  children_price: 0,
  adult_cost: 0,
  children_cost: 0,
  total_amount: 0,
  total_cost: 0,
  notes: ''
};

export const defaultCarValues = {
  region: '',
  pickup_date: '',
  return_date: '',
  model: '',
  options: '',
  driver: '',
  pickup_location: '',
  pickup_time: '',
  rental_days: 1,
  daily_rate: 0,
  total_amount: 0,
  total_cost: 0,
  cost: 0,
  notes: ''
};

export const PRODUCT_STATUS_COLOR: Record<
  keyof typeof ProductStatus,
  typeof selectTriggerPropDefs.color.default
> = {
  Pending: 'gray',
  InProgress: 'gray',
  Confirmed: 'gray',
  ChangeRequested: 'gray',
  CancelRequested: 'ruby',
  Cancelled: 'ruby',
  RefundRequested: 'blue',
  Refunded: 'blue'
};
