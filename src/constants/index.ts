import type { selectTriggerPropDefs } from '@radix-ui/themes/components/select.props';
import type { AdditionalOptions, PaymentStatusKey, ProductStatusKey, ProductType } from '../types';

export * from './query-keys';

export const PER_PAGE = '10';

export const GENDER_TYPE = ['MR', 'MS', 'MSTR', 'MISS'] as const;
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

export enum PaymentStatus {
  Unpaid = '미납',
  Deposit = '예약금',
  Full = '완불',
  Refunded = '환불'
}

export const REGIONS = ['오아후', '마우이', '빅아일랜드', '카우아이', '라나이'] as const;
export type Region = (typeof REGIONS)[number] | (string & {});
export const HOTELS = [
  '쉐라톤 와이키키 비치 리조트',
  '더 웨스틴 마우이 리조트',
  '아웃리거 코나 리조트',
  '그랜드 하얏트 카우아이 리조트 앤 스파',
  '쉐라톤 카우아이 리조트',
  '하얏트 플레이스 와이키키 비치',
  '로얄 라하이나 리조트',
  '힐튼 와이콜로아 빌리지',
  '그랜드 와일레아 리조트',
  '페어몬트 오키드 마우나 라니',
  '쉐라톤 프린세스 카이울라니',
  '와이콜로아 비치 메리어트 리조트 앤 스파',
  '쇼어라인 와이키키',
  '쉐라톤 마우이 리조트 앤 스파',
  '쉐라톤 카우아이 엣 코코넛 비치 ',
  '힐튼 하와이안 빌리지',
  '더 웨스틴 하푸나 비치리조트',
  '더 카할라 리조트',
  '로얄 코나 리조트',
  '리츠칼튼 카팔루아',
  '로얄 하와이언 럭셔리 컬렉션',
  '그랜드 나닐로아 호텔 힐로 더블트리 바이 힐튼',
  '하얏트 리젠시 마우이',
  '코트야드 마우이 카훌루이 에어포트',
  '카 라이 와이키키 비치 (구. 트럼프 와이키키)',
  '와일레아 비치 메리어트 리조트',
  '애스톤 코나 바이 더 시',
  '리츠칼튼 레지던스 와이키키',
  '할레쿨라니',
  '레지던스 인 마우이 와일레아',
  '포시즌 리조트 오아후 앳 코올리나',
  '코트야드 킹 카메하메하 코나 비치',
  '모아나 서프라이더 웨스틴 리조트',
  '안다즈 마우이 앳 와일레아',
  '마우이 비치 호텔',
  '애스톤 카아나팔리 쇼어즈',
  '힐튼 와이키키 비치',
  '하얏트 리젠시 와이키키 비치 리조트 & 스파',
  '와이키키 비치 메리어트 리조트 & 스파',
  '하얏트 센트릭 와이키키 비치',
  '알로힐라니 리조트 와이키키 비치',
  '프린스 와이키키',
  '아웃리거 리프 와키키키 비치 리조트',
  '아웃리거 와이키키 비치 리조트',
  '엠버시 스위트 바이 힐튼 와이키키 비치 워크',
  '힐튼 가든 인 와이키키 비치',
  '더 트윈 핀 비치 (구. 애스톤 와이키키비치)',
  '파크 쇼어 와이키키',
  '퀸 카피올라니 호텔',
  '홀리데이 인 익스프레스 와이키키',
  '코코넛 와이키키 호텔',
  '와이키키 리조트 호텔',
  '애스톤 와이키키 반얀',
  '애스톤 와이키키 선셋',
  '일리카이 호텔 & 럭셔리 스위트',
  '애스톤 와이키키 비치 타워',
  '호텔 라 크로익스',
  '코트야드 바이 메리어트  와이키키 비치',
  '카아나팔리 오션 인 리조트'
];

const additionalOptions = {
  additional_options: [] as AdditionalOptions[]
};

export const defaultClientValues = {
  korean_name: '',
  english_name: '',
  gender: GENDER_TYPE[0],
  resident_id: '',
  phone_number: '',
  email: '',
  notes: ''
};

export const defaultProductValues = {
  exchange_rate: 0,
  total_amount: 0,
  total_cost: 0,
  total_amount_krw: 0,
  total_cost_krw: 0,
  status: 'Pending' as ProductStatusKey,
  payment_status: 'Unpaid' as PaymentStatusKey,
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
  region: REGIONS[0],
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
  region: REGIONS[0],
  start_date: '',
  end_date: '',
  name: '',
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultCarValues = {
  region: REGIONS[0],
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
  reservation_id: '',
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
  RefundRequested: 'red',
  Refunded: 'red'
};

export const PAYMENT_STATUS_COLOR: Record<
  PaymentStatusKey,
  typeof selectTriggerPropDefs.color.default
> = {
  Unpaid: 'gray',
  Deposit: 'blue',
  Full: 'gray',
  Refunded: 'red'
};

export const PRODUCT_LABEL: Record<ProductType, string> = {
  flight: '항공',
  hotel: '호텔',
  tour: '선택관광',
  rental_car: '렌터카',
  insurance: '보험'
};

export const PRODUCT_COLOR: Record<ProductType, typeof selectTriggerPropDefs.color.default> = {
  flight: 'blue',
  hotel: 'green',
  tour: 'amber',
  rental_car: 'violet',
  insurance: 'ruby'
};
