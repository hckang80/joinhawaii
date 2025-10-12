import type { selectTriggerPropDefs } from '@radix-ui/themes/components/select.props';
import type { AdditionalOptions, ProductStatusKey, ProductType } from '../types';

export * from './query-keys';

export const GENDER_TYPE = ['Mr.', 'Ms.', 'Mrs.', 'Miss'] as const;
export type Gender = (typeof GENDER_TYPE)[number] | (string & {});

export enum ProductStatus {
  Pending = '예약요청',
  InProgress = '예약진행',
  Confirmed = '예약완료',
  ChangeRequested = '변경요청',
  CancelRequested = '취소요청',
  Cancelled = '취소완료',
  RefundRequested = '환불요청',
  Refunded = '환불완료'
}

const additionalOptions = {
  additional_options: [] as AdditionalOptions[]
};

export const defaultClientValues = {
  korean_name: '',
  english_name: '',
  gender: 'Mr.' as Gender,
  resident_id: '',
  phone_number: '',
  email: '',
  notes: ''
};

export const defaultProductValues = {
  is_updated_exchange_rate: false,
  exchange_rate: 0,
  total_amount: 0,
  total_cost: 0,
  total_amount_krw: 0,
  cost_amount_krw: 0,
  status: 'Pending' as ProductStatusKey,
  notes: ''
};

export const defaultPeopleValues = {
  adult_count: 0,
  children_count: 0,
  kids_count: 0,
  adult_price: 0,
  children_price: 0,
  kids_price: 0,
  adult_cost: 0,
  children_cost: 0,
  kids_cost: 0
};

export const defaultFlightValues = {
  flight_number: '',
  departure_datetime: '',
  departure_city: '',
  arrival_datetime: '',
  arrival_city: '',
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
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
  cost: 0,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultTourValues = {
  region: '',
  start_date: '',
  end_date: '',
  name: '',
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
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
  cost: 0,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultInsuranceValues = {
  company: '',
  days: 1,
  start_date: '',
  end_date: '',
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultAdditionalOptionValues = {
  pid: 0,
  type: '' as ProductType,
  title: '',
  ...defaultPeopleValues,
  ...defaultProductValues
};

export const PRODUCT_STATUS_COLOR: Record<
  ProductStatusKey,
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

export const PRODUCT_LABEL: Record<ProductType, string> = {
  flight: '항공',
  hotel: '호텔',
  tour: '선택관광',
  rental_car: '렌터카',
  insurance: '보험'
};

export const REGIONS = ['오아후', '마우이', '빅아일랜드', '카우아이', '라나이'] as const;
export type Region = (typeof REGIONS)[number] | (string & {});
