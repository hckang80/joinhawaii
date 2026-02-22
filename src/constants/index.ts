import type { selectTriggerPropDefs } from '@radix-ui/themes/components/select.props';
import type {
  AdditionalOptions,
  PaymentStatusKey,
  ProductStatusKey,
  ProductsType,
  ProductType
} from '../types';

export * from './query-keys';

export const TIME_ZONE = 'Asia/Seoul';

export const CUSTOM_LABEL = '직접입력';

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

export const RENTAL_CAR_SPECIAL_OPTIONS = ['3종보험', '3종보험, 주유, 추가운전자'];

export const PICKUP_LOCATIONS = [
  'Honolulu Airport',
  'Kahala Hotel and Resort',
  'Hyatt Regency Waikiki (2F)',
  'Imperial Hotel',
  'Kahului Airport Maui',
  'Kona Keahole Airport',
  'Hilo Airport',
  'Lihue Airport'
];

export const CAR_TYPES = [
  'Intermediate car',
  'Standard car',
  'Fullsize car',
  'Premium car',
  'Luxury car',
  'Intermediate all-terrain',
  'Standard convertible',
  'Intermediate SUV',
  'Standard SUV',
  'Fullsize recreational',
  'Mini van',
  'Fullsize SUV',
  'Premium SUV'
];

export const ROOM_TYPES = ['1BED', '2BED', '1BED/2BED', '2BED/3BED', '3BED', '4BED'] as const;
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

export const TRIP_TYPES = ['허니문', '가족여행', '일반', '단체'] as const;
export type TripType = (typeof TRIP_TYPES)[number] | (string & {});

export const TRAVEL_CATEGORIES = ['자유여행', '패키지'] as const;
export type TravelCategory = (typeof TRAVEL_CATEGORIES)[number] | (string & {});

export const BOOKING_PLATFORM_OPTIONS = {
  B2C: [
    { value: '홈피', label: '홈피' },
    { value: '조인', label: '조인' }
  ],
  B2B: [
    { value: '샬레', label: '샬레' },
    { value: '마이투어스토리', label: '마이투어스토리' },
    { value: '엘스투어', label: '엘스투어' },
    { value: '내일투어', label: '내일투어' },
    { value: '보성블루투어', label: '보성블루투어' },
    { value: '트레비아', label: '트레비아' },
    { value: '가야투어', label: '가야투어' },
    { value: '여행할때', label: '여행할때' },
    { value: '오리엔탈', label: '오리엔탈' },
    { value: '리조트라이프', label: '리조트라이프' },
    { value: '스테이앤모어', label: '스테이앤모어' },
    { value: '투어앤모어', label: '투어앤모어' }
  ],
  플랫폼: [
    { value: '네이버', label: '네이버' },
    { value: '마이리얼트립', label: '마이리얼트립' },
    { value: '와그', label: '와그' },
    { value: '트리플', label: '트리플' }
  ]
} as const;

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
  status: 'InProgress' as ProductStatusKey,
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
  departure_datetime: null,
  departure_city: '',
  arrival_datetime: null,
  arrival_city: '',
  remarks: '',
  rule: '',
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultHotelValues = {
  region: REGIONS[0],
  check_in_date: null,
  check_out_date: null,
  hotel_name: '',
  room_type: '',
  bed_type: '',
  is_breakfast_included: false,
  is_resort_fee: false,
  nights: 1,
  nightly_rate: 0,
  cost: 0,
  remarks: '',
  rule: '',
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultTourValues = {
  region: REGIONS[0],
  start_date: null,
  end_date: null,
  name: '',
  remarks: '',
  rule: '',
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultCarValues = {
  region: REGIONS[0],
  pickup_date: null,
  return_date: null,
  model: '',
  options: '',
  driver: '',
  pickup_location: '',
  return_location: '',
  rental_days: 1,
  daily_rate: 0,
  cost: 0,
  remarks: '',
  rule: '',
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultInsuranceValues = {
  company: '',
  days: 1,
  start_date: null,
  end_date: null,
  remarks: '',
  rule: '',
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
  Pending: 'red',
  InProgress: 'yellow',
  Confirmed: 'blue',
  ChangeRequested: 'red',
  CancelRequested: 'red',
  Cancelled: 'blue',
  RefundRequested: 'red',
  Refunded: 'blue'
};

export const PAYMENT_STATUS_COLOR: Record<
  PaymentStatusKey,
  typeof selectTriggerPropDefs.color.default
> = {
  Unpaid: 'yellow',
  Deposit: 'blue',
  Full: 'green',
  Refunded: 'red'
};

export const PRODUCT_OPTIONS: { label: string; value: ProductType; table: ProductsType }[] = [
  {
    label: '항공',
    value: 'flight',
    table: 'flights'
  },
  {
    label: '호텔',
    value: 'hotel',
    table: 'hotels'
  },
  {
    label: '선택관광',
    value: 'tour',
    table: 'tours'
  },
  {
    label: '렌터카',
    value: 'rental_car',
    table: 'rental_cars'
  },
  {
    label: '보험',
    value: 'insurance',
    table: 'insurances'
  }
];

export const PRODUCT_LABEL: Record<ProductType, string> = PRODUCT_OPTIONS.reduce(
  (acc, { value, label }) => {
    acc[value] = label;
    return acc;
  },
  {} as Record<ProductType, string>
);

export const PRODUCT_COLOR: Record<ProductType, typeof selectTriggerPropDefs.color.default> = {
  flight: 'blue',
  hotel: 'green',
  tour: 'amber',
  rental_car: 'violet',
  insurance: 'ruby'
};
