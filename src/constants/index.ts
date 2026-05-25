import type { selectTriggerPropDefs } from '@radix-ui/themes/components/select.props';
import type {
  AdditionalOptions,
  PaymentStatusKey,
  ProductStatusKey,
  ProductsType,
  ProductType
} from '../types';

export * from './query-keys';

export const TIME_ZONE = 'UTC';

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
  Refunded = '환불완료',
  OnHold = '보류',
  Checked = '확인'
}

export enum PaymentStatus {
  Unpaid = '미납',
  Deposit = '예약금',
  Full = '완불',
  Refunded = '환불'
}

export const JOB_FUNCTION: Record<string, string> = {
  'joinhawaiikoreausa@gmail.com': '대표',
  'joinhawaii@joinhawaii.com': '대표',
  'tjsdk525@gmail.com': '팀장',
  'hckang80@gmail.com': '관리자'
};

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
] as const;

export const BED_TYPE_LIST = ['1 BED', '2 BEDS', '3 BEDS', '4 BEDS'] as const;

export const HOTEL_ROOM_TYPE_LIST = [
  'CITY VIEW',
  'RESORT VIEW',
  'OCEAN VIEW',
  'OCEAN FRONT',
  'PARTIAL OCEAN VIEW',
  'DIAMOND HEAD OCEAN FRONT',
  'DELUXE OCEAN VIEW',
  'RUN OF OCEAN',
  'RUN OF HOUSE',
  'PAOKALANI OCEAN VIEW',
  'KEALOHILANI OCEAN VIEW'
];

export const RESORT_FEE_TYPE_LIST = [
  {
    value: 'INCLUSION',
    label: '포함'
  },
  {
    value: 'EXCLUSION',
    label: '불포함'
  },
  {
    value: 'NO RESORT FEE',
    label: '없음'
  }
];

export type GroupSelectOption = {
  value: string;
  label: string;
  en_label?: string;
};
export const ROOM_TYPES = ['1BED', '2BED', '1BED/2BED', '2BED/3BED', '3BED', '4BED'] as const;
export const REGIONS = ['오아후', '마우이', '빅아일랜드', '카우아이'] as const;
export type Region = (typeof REGIONS)[number] | (string & {});
export const HOTELS: Record<Region, GroupSelectOption[]> = {
  오아후: [
    { value: '더 카할라 리조트', label: '더 카할라 리조트', en_label: 'THE KAHALA RESORT' },
    { value: '더 트윈 핀 비치', label: '더 트윈 핀 비치', en_label: 'THE TWIN FIN BEACH' },
    {
      value: '로얄 하와이언 럭셔리 컬렉션',
      label: '로얄 하와이언 럭셔리 컬렉션',
      en_label: 'ROYAL HAWAIIAN LUXURY COLLECTION'
    },
    {
      value: '리츠칼튼 레지던스 와이키키',
      label: '리츠칼튼 레지던스 와이키키',
      en_label: 'THE RITZCARLTON RESIDENCES WAIKIKI'
    },
    {
      value: '모아나 서프라이더 웨스틴 리조트',
      label: '모아나 서프라이더 웨스틴 리조트',
      en_label: 'MOANA SURFRIDER A WESTIN RESORT SPA WAIKIKI BEACH'
    },
    { value: '쇼어라인 와이키키', label: '쇼어라인 와이키키', en_label: 'SHORELINE WAIKIKI' },
    {
      value: '쉐라톤 와이키키 비치 리조트',
      label: '쉐라톤 와이키키 비치 리조트',
      en_label: 'SHERATON WAIKIKI BEACH RESORT'
    },
    {
      value: '쉐라톤 프린세스 카이울라니',
      label: '쉐라톤 프린세스 카이울라니',
      en_label: 'SHERATON PRINCESS KAIULANI'
    },
    {
      value: '아웃리거 리프 와키키키 비치 리조트',
      label: '아웃리거 리프 와키키키 비치 리조트',
      en_label: 'OUTRIGGER REEF WAIKIKI BEACH RESORT'
    },
    {
      value: '아웃리거 와이키키 비치 리조트',
      label: '아웃리거 와이키키 비치 리조트',
      en_label: 'OUTRIGGER WAIKIKI BEACH RESORT'
    },
    {
      value: '알로힐라니 리조트 와이키키 비치',
      label: '알로힐라니 리조트 와이키키 비치',
      en_label: 'ALOHILANI RESORT WAIKIKI BEACH'
    },
    {
      value: '애스톤 와이키키 반얀',
      label: '애스톤 와이키키 반얀',
      en_label: 'ASTON WAIKIKI BANYAN'
    },
    {
      value: '애스톤 와이키키 비치 타워',
      label: '애스톤 와이키키 비치 타워',
      en_label: 'ASTON WAIKIKI BEACH TOWER'
    },
    {
      value: '애스톤 와이키키 선셋',
      label: '애스톤 와이키키 선셋',
      en_label: 'ASTON WAIKIKI SUNSET'
    },
    {
      value: '엠버시 스위트 바이 힐튼 와이키키 비치 워크',
      label: '엠버시 스위트 바이 힐튼 와이키키 비치 워크',
      en_label: 'EMBASSY SUITES BY HILTON WAIKIKI BEACH WALK'
    },
    {
      value: '와이키키 리조트 호텔',
      label: '와이키키 리조트 호텔',
      en_label: 'WAIKIKI RESORT HOTEL'
    },
    {
      value: '와이키키 비치 메리어트 리조트 & 스파',
      label: '와이키키 비치 메리어트 리조트 & 스파',
      en_label: 'WAIKIKI BEACH MARRIOTT RESORT'
    },
    {
      value: '일리카이 호텔 & 럭셔리 스위트',
      label: '일리카이 호텔 & 럭셔리 스위트',
      en_label: 'ILIKAI HOTEL LUXURY SUITES'
    },
    {
      value: '카 라이 와이키키 비치',
      label: '카 라이 와이키키 비치',
      en_label: 'KA LAI WAIKIKI BEACH'
    },
    {
      value: '코코넛 와이키키 호텔',
      label: '코코넛 와이키키 호텔',
      en_label: 'COCONUT WAIKIKI HOTEL'
    },
    {
      value: '코트야드 바이 메리어트 와이키키 비치',
      label: '코트야드 바이 메리어트 와이키키 비치',
      en_label: 'COURTYARD BY MARRIOTT WAIKIKI BEACH'
    },
    { value: '퀸 카피올라니 호텔', label: '퀸 카피올라니 호텔', en_label: 'QUEEN KAPIOLANI HOTEL' },
    { value: '파크 쇼어 와이키키', label: '파크 쇼어 와이키키', en_label: 'PARK SHORE WAIKIKI' },
    {
      value: '포시즌 리조트 오아후 앳 코올리나',
      label: '포시즌 리조트 오아후 앳 코올리나',
      en_label: 'FOUR SEASONS RESORT OAHU AT KO OLINA'
    },
    { value: '프린스 와이키키', label: '프린스 와이키키', en_label: 'PRINCE WAIKIKI HOTEL' },
    {
      value: '하얏트 리젠시 와이키키 비치 리조트 & 스파',
      label: '하얏트 리젠시 와이키키 비치 리조트 & 스파',
      en_label: 'HYATT REGENCY WAIKIKI BEACH RESORT AND SPA'
    },
    {
      value: '하얏트 센트릭 와이키키 비치',
      label: '하얏트 센트릭 와이키키 비치',
      en_label: 'HYATT CENTRIC WAIKIKI BEACH'
    },
    {
      value: '하얏트 플레이스 와이키키 비치',
      label: '하얏트 플레이스 와이키키 비치',
      en_label: 'HYATT PLACE WAIKIKI BEACH'
    },
    { value: '할레쿨라니', label: '할레쿨라니', en_label: 'HALEKULANI' },
    { value: '호텔 라 크로익스', label: '호텔 라 크로익스', en_label: 'HOTEL LA CROIX' },
    {
      value: '홀리데이 인 익스프레스 와이키키',
      label: '홀리데이 인 익스프레스 와이키키',
      en_label: 'HOLIDAY INN EXPRESS WAIKIKI'
    },
    {
      value: '힐튼 가든 인 와이키키 비치',
      label: '힐튼 가든 인 와이키키 비치',
      en_label: 'HILTON GARDEN INN WAIKIKI BEACH'
    },
    { value: '힐튼 와이키키 비치', label: '힐튼 와이키키 비치', en_label: 'HILTON WAIKIKI BEACH' },
    {
      value: '힐튼 하와이안 빌리지',
      label: '힐튼 하와이안 빌리지',
      en_label: 'HILTON HAWAIIAN VILLAGE'
    }
  ],
  마우이: [
    {
      value: '그랜드 와일레아 리조트',
      label: '그랜드 와일레아 리조트',
      en_label: 'GRAND WAILEA RESORT'
    },
    {
      value: '더 웨스틴 마우이 리조트',
      label: '더 웨스틴 마우이 리조트',
      en_label: 'THE WESTIN MAUI RESORT'
    },
    {
      value: '리츠칼튼 카팔루아',
      label: '리츠칼튼 카팔루아',
      en_label: 'THE RITZCARLTON KAPALUA'
    },
    {
      value: '레지던스 인 마우이 와일레아',
      label: '레지던스 인 마우이 와일레아',
      en_label: 'RESIDENCE INN MAUI WAILEA'
    },
    {
      value: '로얄 라하이나 리조트',
      label: '로얄 라하이나 리조트',
      en_label: 'ROYAL LAHAINA RESORT'
    },
    {
      value: '마우이 비치 호텔',
      label: '마우이 비치 호텔',
      en_label: 'MAUI BEACH HOTEL'
    },
    {
      value: '쉐라톤 마우이 리조트 앤 스파',
      label: '쉐라톤 마우이 리조트 앤 스파',
      en_label: 'SHERATON MAUI RESORT AND SPA'
    },
    {
      value: '안다즈 마우이 앳 와일레아',
      label: '안다즈 마우이 앳 와일레아',
      en_label: 'ANDAZ MAUI AT WAILEA'
    },
    {
      value: '애스톤 카아나팔리 쇼어즈',
      label: '애스톤 카아나팔리 쇼어즈',
      en_label: 'ASTON KAANAPALI SHORES'
    },
    {
      value: '와일레아 비치 메리어트 리조트',
      label: '와일레아 비치 메리어트 리조트',
      en_label: 'WAILEA BEACH MARRIOTT RESORT'
    },
    {
      value: '카아나팔리 오션 인 리조트',
      label: '카아나팔리 오션 인 리조트',
      en_label: 'KAANAPALI OCEAN INN RESORT'
    },
    {
      value: '코트야드 마우이 카훌루이 에어포트',
      label: '코트야드 마우이 카훌루이 에어포트',
      en_label: 'COURTYARD MAUI KAHULUI AIRPORT'
    },
    {
      value: '하얏트 리젠시 마우이',
      label: '하얏트 리젠시 마우이',
      en_label: 'HYATT REGENCY MAUI RESORT AND SPA'
    }
  ],
  빅아일랜드: [
    {
      value: '더 웨스틴 하푸나 비치리조트',
      label: '더 웨스틴 하푸나 비치리조트',
      en_label: 'THE WESTIN HAPUNA BEACH RESORT'
    },
    {
      value: '그랜드 나닐로아 호텔 힐로 더블트리 바이 힐튼',
      label: '그랜드 나닐로아 호텔 힐로 더블트리 바이 힐튼',
      en_label: 'GRAND NANILOA HOTEL HILO A DOUBLETREE BY HILTON'
    },
    {
      value: '로얄 코나 리조트',
      label: '로얄 코나 리조트',
      en_label: 'ROYAL KONA RESORT'
    },
    {
      value: '아웃리거 코나 리조트',
      label: '아웃리거 코나 리조트',
      en_label: 'OUTRIGGER KONA AT KEAUHOU BAY'
    },
    {
      value: '애스톤 코나 바이 더 시',
      label: '애스톤 코나 바이 더 시',
      en_label: 'ASTON KONA BY THE SEA'
    },
    {
      value: '코트야드 킹 카메하메하 코나 비치',
      label: '코트야드 킹 카메하메하 코나 비치',
      en_label: 'COURTYARD KING KAMEHAMEHAS KONA BEACH HOTEL'
    },
    {
      value: '페어몬트 오키드 마우나 라니',
      label: '페어몬트 오키드 마우나 라니',
      en_label: 'FAIRMONT ORCHID MAUNA LANI'
    },
    {
      value: '와이콜로아 비치 메리어트 리조트 앤 스파',
      label: '와이콜로아 비치 메리어트 리조트 앤 스파',
      en_label: 'WAIKOLOA BEACH MARRIOTT RESORT SPA'
    },
    {
      value: '힐튼 와이콜로아 빌리지',
      label: '힐튼 와이콜로아 빌리지',
      en_label: 'HILTON WAIKOLOA VILLAGE'
    }
  ],
  카우아이: [
    {
      value: '그랜드 하얏트 카우아이 리조트 앤 스파',
      label: '그랜드 하얏트 카우아이 리조트 앤 스파',
      en_label: 'GRAND HYATT KAUAI RESORT SPA'
    },
    {
      value: '쉐라톤 카우아이 리조트',
      label: '쉐라톤 카우아이 리조트',
      en_label: 'SHERATON KAUAI RESORT'
    },
    {
      value: '쉐라톤 카우아이 엣 코코넛 비치',
      label: '쉐라톤 카우아이 엣 코코넛 비치',
      en_label: 'SHERATON KAUAI AT COCONUT BEACH'
    }
  ]
};

export const TRIP_TYPES = ['허니문', '가족여행', '일반', '단체'] as const;
export type TripType = (typeof TRIP_TYPES)[number] | (string & {});

export const TRAVEL_CATEGORIES = ['자유여행', '패키지'] as const;
export type TravelCategory = (typeof TRAVEL_CATEGORIES)[number] | (string & {});

export const PLATFORMS = ['B2C', 'B2B', '플랫폼'] as const;
export type Platform = (typeof PLATFORMS)[number] | (string & {});
export const BOOKING_PLATFORM_OPTIONS: Record<Platform, GroupSelectOption[]> = {
  B2C: [
    { value: '홈페이지', label: '홈페이지' },
    { value: '조인하와이', label: '조인하와이' }
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
    { value: '클룩', label: '클룩' },
    { value: '트리플', label: '트리플' }
  ]
};

export const TOURS = ['공항셔틀', '일주관광', '해양스포츠', '액티비티', '스냅', '기타'] as const;
export type TourCategory = (typeof TOURS)[number] | (string & {});
export const TOURS_OPTIONS: Record<TourCategory, GroupSelectOption[]> = {
  공항셔틀: [
    {
      value: '[공항 셔틀서비스]한인택시 단독 공항-와이키키 픽업',
      label: '[공항 셔틀서비스]한인택시 단독 공항-와이키키 픽업',
      en_label: 'AIRPORT TRANSPORTATION AIRPORT-WAIKIKI PICKUP'
    },
    {
      value: '[공항 셔틀서비스]한인택시 단독 와이키키-공항 샌딩',
      label: '[공항 셔틀서비스]한인택시 단독 와이키키-공항 샌딩',
      en_label: 'AIRPORT TRANSPORTATION WAIKIKI-AIRPORT SANDING'
    },
    {
      value: '[공항 셔틀서비스]한인택시 단독 공항-와이키키 픽업샌딩 왕복',
      label: '[공항 셔틀서비스]한인택시 단독 공항-와이키키 픽업샌딩 왕복',
      en_label: 'AIRPORT TRANSPORTATION AIRPORT-WAIKIKI'
    },
    {
      value: '[공항 셔틀서비스]10인승 단독 공항-와이키키 픽업',
      label: '[공항 셔틀서비스]10인승 단독 공항-와이키키 픽업',
      en_label: 'AIRPORT TRANSPORTATION AIRPORT-WAIKIKI PICKUP 10PAX'
    },
    {
      value: '[공항 셔틀서비스]10인승 단독 와이키키-공항 샌딩',
      label: '[공항 셔틀서비스]10인승 단독 와이키키-공항 샌딩',
      en_label: 'AIRPORT TRANSPORTATION WAIKIKI-AIRPORT SANDING 10PAX'
    },
    {
      value: '[공항 셔틀서비스]10인승 단독 공항-와이키키 픽업샌딩 왕복',
      label: '[공항 셔틀서비스]10인승 단독 공항-와이키키 픽업샌딩 왕복',
      en_label: 'AIRPORT TRANSPORTATION AIRPORT-WAIKIKI 10PAX'
    }
  ],
  일주관광: [
    {
      value: '[오아후섬 투어]단독 2~3인승',
      label: '[오아후섬 투어]단독 2~3인승',
      en_label: 'OAHU ISLAND TOUR CHARTER 2~3PAX'
    },
    {
      value: '[오아후섬 투어]단독 4~5인승',
      label: '[오아후섬 투어]단독 4~5인승',
      en_label: 'OAHU ISLAND TOUR CHARTER 4~5PAX'
    },
    {
      value: '[오아후섬 투어]단독 10인승',
      label: '[오아후섬 투어]단독 10인승',
      en_label: 'OAHU ISLAND TOUR CHARTER 10PAX'
    },
    {
      value: '[오아후섬 투어]합류',
      label: '[오아후섬 투어]합류',
      en_label: 'OAHU ISLAND TOUR JOIN'
    },
    {
      value: '[일일관광]빅아일랜드 일일관광 와이키키픽업',
      label: '[일일관광]빅아일랜드 일일관광 와이키키픽업',
      en_label: 'ONE DAY BIGISLAND TOUR WAIKIKI'
    },
    {
      value: '[일일관광]빅아일랜드 일일관광 코나/힐로픽업',
      label: '[일일관광]빅아일랜드 일일관광 코나/힐로픽업',
      en_label: 'ONE DAY BIGISLAND TOUR KONA/HILLO'
    },
    {
      value: '[일일관광]마우이 일일관광',
      label: '[일일관광]마우이 일일관광',
      en_label: 'ONE DAY MAUI TOUR'
    },
    {
      value: '[일일관광]카우아이 일일관광',
      label: '[일일관광]카우아이 일일관광',
      en_label: 'ONE DAY KAUAI TOUR'
    }
  ],
  해양스포츠: [
    { value: '돌핀 앤 유', label: '돌핀 앤 유', en_label: 'DOLPHIN AND YOU' },
    {
      value: '(마우이) 몰로키니 스노클링 - 칼립소',
      label: '(마우이) 몰로키니 스노클링 - 칼립소',
      en_label: 'MAUI MOLOKINI SNORKELING CALYPSO'
    },
    {
      value: '(빅아일랜드) 코나 만타레이 선셋 스노클링',
      label: '(빅아일랜드) 코나 만타레이 선셋 스노클링',
      en_label: 'KONA MANTARAY SNOKELING'
    },
    {
      value: '[카네오헤 샌드바 어드밴처]스탠다드',
      label: '[카네오헤 샌드바 어드밴처]스탠다드',
      en_label: 'KANEOHE SANDBAR ADVENTURE STANDARD'
    },
    {
      value: '[카네오헤 샌드바 어드밴처]디럭스',
      label: '[카네오헤 샌드바 어드밴처]디럭스',
      en_label: 'KANEOHE SANDBAR ADVENTURE DELUXE'
    },
    {
      value: '[하나우마베이 스노클링]디럭스 스탠다드',
      label: '[하나우마베이 스노클링]디럭스 스탠다드',
      en_label: 'HANAUMA BAY SNORKELING STANDARD'
    },
    {
      value: '[하나우마베이 스노클링]디럭스 프리미엄',
      label: '[하나우마베이 스노클링]디럭스 프리미엄',
      en_label: 'HANAUMA BAY SNORKELING PREMIUM'
    },
    {
      value: '[하나우마베이 스노클링]얼리버드',
      label: '[하나우마베이 스노클링]얼리버드',
      en_label: 'HANAUMA BAY SNORKELING EARLY BIRD'
    },
    {
      value: '[하와이 서핑]소그룹 2~3인',
      label: '[하와이 서핑]소그룹 2~3인',
      en_label: 'HAWAII SURFING 2~3PAX'
    },
    {
      value: '[하와이 서핑]프라이빗 1인',
      label: '[하와이 서핑]프라이빗 1인',
      en_label: 'HAWAII SURFING PRIVATE 1PAX'
    },
    {
      value: '[하와이 서핑]라이더',
      label: '[하와이 서핑]라이더',
      en_label: 'HAWAII SURFING RIDER'
    },
    {
      value: '혹등고래 관찰 크루즈',
      label: '혹등고래 관찰 크루즈',
      en_label: 'WHALE WATCHING CRUISES'
    }
  ],
  액티비티: [
    {
      value: '[무동력 글라이더]시닉 라이더 15분 1인탑승',
      label: '[무동력 글라이더]시닉 라이더 15분 1인탑승',
      en_label: 'GLIDER SENIC RIDERS 15MIN 1PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 15분 2인탑승',
      label: '[무동력 글라이더]시닉 라이더 15분 2인탑승',
      en_label: 'GLIDER SENIC RIDERS 15MIN 2PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 20분 1인탑승',
      label: '[무동력 글라이더]시닉 라이더 20분 1인탑승',
      en_label: 'GLIDER SENIC RIDERS 20MIN 1PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 20분 2인탑승',
      label: '[무동력 글라이더]시닉 라이더 20분 2인탑승',
      en_label: 'GLIDER SENIC RIDERS 20MIN 2PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 30분 1인탑승',
      label: '[무동력 글라이더]시닉 라이더 30분 1인탑승',
      en_label: 'GLIDER SENIC RIDERS 30MIN 1PAX'
    },
    {
      value: '[무동력 글라이더]시닉 라이더 30분 2인탑승',
      label: '[무동력 글라이더]시닉 라이더 30분 2인탑승',
      en_label: 'GLIDER SENIC RIDERS 30MIN 2PAX'
    },
    {
      value: '[무동력 글라이더]에어로바틱 라이더 15분 1인탑승',
      label: '[무동력 글라이더]에어로바틱 라이더 15분 1인탑승',
      en_label: 'GLIDER AEROBATIC RIDER 15MIN 1PAX'
    },
    {
      value: '[무동력 글라이더]에어로바틱 라이더 20분 1인탑승',
      label: '[무동력 글라이더]에어로바틱 라이더 20분 1인탑승',
      en_label: 'GLIDER AEROBATIC RIDER 20MIN 2PAX'
    },
    {
      value: '[블루 하와이안 헬기투어]오아후 BLUE SKIES OF OAHU',
      label: '[블루 하와이안 헬기투어]오아후 BLUE SKIES OF OAHU',
      en_label: 'OAHU BLUE HAWAIIAN HELICOPTER BLUE SKIES OF OAHU'
    },
    {
      value: '[블루 하와이안 헬기투어]오아후 COMPLETE ISLAND',
      label: '[블루 하와이안 헬기투어]오아후 COMPLETE ISLAND',
      en_label: 'OAHU BLUE HAWAIIAN HELICOPTER COMPLETE ISLAND'
    },
    {
      value: '[블루 하와이안 헬기투어]오아후 TURTLE BAY OAHU AIR ADVENTURE',
      label: '[블루 하와이안 헬기투어]오아후 TURTLE BAY OAHU AIR ADVENTURE',
      en_label: 'OAHU BLUE HAWAIIAN HELICOPTER TURTLE BAY OAHU AIR ADVENTURE'
    },
    {
      value: '[블루 하와이안 헬기투어]오아후 TURTLE BAY DISCOVER NORTH SHORE',
      label: '[블루 하와이안 헬기투어]오아후 TURTLE BAY DISCOVER NORTH SHORE',
      en_label: 'OAHU BLUE HAWAIIAN HELICOPTER TURTLE BAY DISCOVER NORTH SHORE'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 DISCOVER HILO',
      label: '[블루 하와이안 헬기투어]빅아일랜드 DISCOVER HILO',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELICOPTER DISCOVER HILO'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 HILO WATERFALL EXPERIENCE',
      label: '[블루 하와이안 헬기투어]빅아일랜드 HILO WATERFALL EXPERIENCE',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELICOPTER HILO WATERFALL EXPERIENCE'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA BIG ISLAND SPECTACULAR',
      label: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA BIG ISLAND SPECTACULAR',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELICOPTER WAIKOLOA BIG ISLAND SPECTACULAR'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA KOHALA COAST ADVENTURE',
      label: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA KOHALA COAST ADVENTURE',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELICOPTER WAIKOLOA KOHALA COAST ADVENTURE'
    },
    {
      value: '[블루 하와이안 헬기투어]마우이 HANA RAINFOREST',
      label: '[블루 하와이안 헬기투어]마우이 HANA RAINFOREST',
      en_label: 'MAUI BLUE HAWAIIAN HELICOPTER HANA RAINFOREST'
    },
    {
      value: '[블루 하와이안 헬기투어]마우이 MAJESTIC MAUI',
      label: '[블루 하와이안 헬기투어]마우이 MAJESTIC MAUI',
      en_label: 'MAUI BLUE HAWAIIAN HELICOPTER MAJESTIC MAUI'
    },
    {
      value: '[블루 하와이안 헬기투어]마우이 WEST MAUI AND MOLOKAI',
      label: '[블루 하와이안 헬기투어]마우이 WEST MAUI AND MOLOKAI',
      en_label: 'MAUI BLUE HAWAIIAN HELICOPTER WEST MAUI AND MOLOKAI'
    },
    {
      value: '[블루 하와이안 헬기투어]마우이 MAUI & MOLOKAI SPECTACULAR',
      label: '[블루 하와이안 헬기투어]마우이 MAUI & MOLOKAI SPECTACULAR',
      en_label: 'MAUI BLUE HAWAIIAN HELICOPTER MAUI & MOLOKAI SPECTACULAR'
    },
    {
      value: '[블루 하와이안 헬기투어]카우아이 ECO ADVENTURE',
      label: '[블루 하와이안 헬기투어]카우아이 ECO ADVENTURE',
      en_label: 'KAUAI BLUE HAWAIIAN HELICOPTER ECO ADVENTURE'
    },
    {
      value: '[블루 하와이안 헬기투어]카우아이 DISCOVER KAUAI',
      label: '[블루 하와이안 헬기투어]카우아이 DISCOVER KAUAI',
      en_label: 'KAUAI BLUE HAWAIIAN HELICOPTER DISCOVER KAUAI'
    },
    {
      value: '[쿠알로아랜치]UTV 랩터 어드벤처 2시간 픽업불포함',
      label: '[쿠알로아랜치]UTV 랩터 어드벤처 2시간 픽업불포함',
      en_label: 'KUALOA RANCH UTV RAPTOR ADVENTURE 2H NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]UTV 랩터 어드벤처 2시간 픽업포함',
      label: '[쿠알로아랜치]UTV 랩터 어드벤처 2시간 픽업포함',
      en_label: 'KUALOA RANCH UTV RAPTOR ADVENTURE 2H PICKUP'
    },
    {
      value: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업불포함',
      label: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업불포함',
      en_label: 'KUALOA RANCH UTV RIDE ALONG ADVENTURE 2H NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업포함',
      label: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업포함',
      en_label: 'KUALOA RANCH UTV RIDE ALONG ADVENTURE 2H PICKUP'
    },
    {
      value: '[쿠알로아랜치]UTV 랩터 어드벤처 3시간 픽업불포함',
      label: '[쿠알로아랜치]UTV 랩터 어드벤처 3시간 픽업불포함',
      en_label: 'KUALOA RANCH UTV RAPTOR ADVENTURE 3H NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]UTV 랩터 어드벤처 3시간 픽업포함',
      label: '[쿠알로아랜치]UTV 랩터 어드벤처 3시간 픽업포함',
      en_label: 'KUALOA RANCH UTV RAPTOR ADVENTURE 3H PICKUP'
    },
    {
      value: '[쿠알로아랜치]UTV 어드벤처 3시간 가이드운전 픽업불포함',
      label: '[쿠알로아랜치]UTV 어드벤처 3시간 가이드운전 픽업불포함',
      en_label: 'KUALOA RANCH UTV ADVENTURE 3H NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]UTV 어드벤처 3시간 가이드운전 픽업포함',
      label: '[쿠알로아랜치]UTV 어드벤처 3시간 가이드운전 픽업포함',
      en_label: 'KUALOA RANCH UTV ADVENTURE 3H PICKUP'
    },
    {
      value: '[쿠알로아랜치]무비사이트 픽업불포함',
      label: '[쿠알로아랜치]무비사이트 픽업불포함',
      en_label: 'KUALOA RANCH MOVIE SITE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]무비사이트 픽업포함',
      label: '[쿠알로아랜치]무비사이트 픽업포함',
      en_label: 'KUALOA RANCH MOVIE SITE PICKUP'
    },
    {
      value: '[쿠알로아랜치]씨크릿 아일랜드 비치 어드벤처 픽업불포함',
      label: '[쿠알로아랜치]씨크릿 아일랜드 비치 어드벤처 픽업불포함',
      en_label: 'KUALOA RANCH SECRET ISLAND BEACH ADVENTURE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]씨크릿 아일랜드 비치 어드벤처 픽업포함',
      label: '[쿠알로아랜치]씨크릿 아일랜드 비치 어드벤처 픽업포함',
      en_label: 'KUALOA RANCH SECRET ISLAND BEACH ADVENTURE PICKUP'
    },
    {
      value: '[쿠알로아랜치]오션보야지 픽업불포함',
      label: '[쿠알로아랜치]오션보야지 픽업불포함',
      en_label: 'KUALOA RANCH OCEAN VOYAGE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]오션보야지 픽업포함',
      label: '[쿠알로아랜치]오션보야지 픽업포함',
      en_label: 'KUALOA RANCH OCEAN VOYAGE PICKUP'
    },
    {
      value: '[쿠알로아랜치]익스피리언스 패키지 픽업불포함',
      label: '[쿠알로아랜치]익스피리언스 패키지 픽업불포함',
      en_label: 'BEST OF KUALOA EXPERIENCE PACKAGE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]익스피리언스 패키지 픽업포함',
      label: '[쿠알로아랜치]익스피리언스 패키지 픽업포함',
      en_label: 'BEST OF KUALOA EXPERIENCE PACKAGE PICKUP'
    },
    {
      value: '[쿠알로아랜치]전기 산악바이크 투어 픽업불포함',
      label: '[쿠알로아랜치]전기 산악바이크 투어 픽업불포함',
      en_label: 'KUALOA RANCH ELECTRIC MOUNTAIN BIKE TOUR NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]전기 산악바이크 투어 픽업포함',
      label: '[쿠알로아랜치]전기 산악바이크 투어 픽업포함',
      en_label: 'KUALOA RANCH ELECTRIC MOUNTAIN BIKE TOUR PICKUP'
    },
    {
      value: '[쿠알로아랜치]정글투어 픽업불포함',
      label: '[쿠알로아랜치]정글투어 픽업불포함',
      en_label: 'KUALOA RANCH JUNGLE EXPEDITION NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]정글투어 픽업포함',
      label: '[쿠알로아랜치]정글투어 픽업포함',
      en_label: 'KUALOA RANCH JUNGLE EXPEDITION PICKUP'
    },
    {
      value: '[쿠알로아랜치]쥬라기 어드벤처 투어 픽업불포함',
      label: '[쿠알로아랜치]쥬라기 어드벤처 투어 픽업불포함',
      en_label: 'KUALOA RANCH JURASSIC ADVENTURE TOUR NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]쥬라기 어드벤처 투어 픽업포함',
      label: '[쿠알로아랜치]쥬라기 어드벤처 투어 픽업포함',
      en_label: 'KUALOA RANCH JURASSIC ADVENTURE TOUR PICKUP'
    },
    {
      value: '[쿠알로아랜치]쥬라기계곡 집라인 투어 픽업불포함',
      label: '[쿠알로아랜치]쥬라기계곡 집라인 투어 픽업불포함',
      en_label: 'KUALOA RANCH JURASSIC VALLEY ZIPLINE TOUR NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]쥬라기계곡 집라인 투어 픽업포함',
      label: '[쿠알로아랜치]쥬라기계곡 집라인 투어 픽업포함',
      en_label: 'KUALOA RANCH JURASSIC VALLEY ZIPLINE TOUR PICKUP'
    },
    {
      value: '[쿠알로아랜치]쿠알로아 하프데이 패키지 픽업불포함',
      label: '[쿠알로아랜치]쿠알로아 하프데이 패키지 픽업불포함',
      en_label: 'KUALOA HALF DAY PACKAGE NO PICKUP'
    },
    {
      value: '[쿠알로아랜치]쿠알로아 하프데이 패키지 픽업포함',
      label: '[쿠알로아랜치]쿠알로아 하프데이 패키지 픽업포함',
      en_label: 'KUALOA HALF DAY PACKAGE PICKUP'
    }
  ],
  스냅: [
    {
      value: '[하와이 스냅]와이키키 커플스냅 30분',
      label: '[하와이 스냅]와이키키 커플스냅 30분',
      en_label: 'HAWAII SNAP WAIKIKI COUPLE 30MIN'
    },
    {
      value: '[하와이 스냅]와이키키 커플스냅 1시간',
      label: '[하와이 스냅]와이키키 커플스냅 1시간',
      en_label: 'HAWAII SNAP WAIKIKI COUPLE 60MIN'
    },
    {
      value: '[하와이 스냅]와이키키 가족스냅 30분',
      label: '[하와이 스냅]와이키키 가족스냅 30분',
      en_label: 'HAWAII SNAP WAIKIKI FAMILY 30MIN'
    },
    {
      value: '[하와이 스냅]와이키키 가족스냅 1시간',
      label: '[하와이 스냅]와이키키 가족스냅 1시간',
      en_label: 'HAWAII SNAP WAIKIKI FAMILY 60MIN'
    },
    {
      value: '[하와이 스냅]비치선셋 1시간',
      label: '[하와이 스냅]비치선셋 1시간',
      en_label: 'HAWAII SNAP BEACH SUNSET 60MIN'
    }
  ],
  기타: [
    {
      value: '[다이아몬드 헤드 하이킹]1~2명',
      label: '[다이아몬드 헤드 하이킹]1~2명',
      en_label: 'DIAMOND HEAD HIKING 1~2PAX'
    },
    {
      value: '[다이아몬드 헤드 하이킹]3~4명',
      label: '[다이아몬드 헤드 하이킹]3~4명',
      en_label: 'DIAMOND HEAD HIKING 3~4PAX'
    },
    {
      value: '(빅아일랜드) 마우나케아 서밋 & 스타스',
      label: '(빅아일랜드) 마우나케아 서밋 & 스타스',
      en_label: 'BIGISLAND MAUNAKEA SUMMIT STARS'
    },
    {
      value: '[스타 오브 호놀룰루]3스타 픽업불포함',
      label: '[스타 오브 호놀룰루]3스타 픽업불포함',
      en_label: 'STAR OF HONOLULU 3STAR NO PICKUP'
    },
    {
      value: '[스타 오브 호놀룰루]3스타 픽업포함',
      label: '[스타 오브 호놀룰루]3스타 픽업포함',
      en_label: 'STAR OF HONOLULU 3STAR PICKUP'
    },
    {
      value: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 픽업불포함',
      label: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 픽업불포함',
      en_label: 'STAR OF HONOLULU 3STAR FRIDAY NO PICKUP'
    },
    {
      value: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 픽업포함',
      label: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 픽업포함',
      en_label: 'STAR OF HONOLULU 3STAR FRIDAY PICKUP'
    },
    {
      value: '[스타 오브 호놀룰루]3스타 셀레브레이션 픽업불포함',
      label: '[스타 오브 호놀룰루]3스타 셀레브레이션 픽업불포함',
      en_label: 'STAR OF HONOLULU 3STAR CELEBRATION NO PICKUP'
    },
    {
      value: '[스타 오브 호놀룰루]3스타 셀레브레이션 픽업포함',
      label: '[스타 오브 호놀룰루]3스타 셀레브레이션 픽업포함',
      en_label: 'STAR OF HONOLULU 3STAR CELEBRATION PICKUP'
    },
    {
      value: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 셀레브레이션 픽업불포함',
      label: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 셀레브레이션 픽업불포함',
      en_label: 'STAR OF HONOLULU 3STAR FRIDAY CELEBRATION NO PICKUP'
    },
    {
      value: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 셀레브레이션 픽업포함',
      label: '[스타 오브 호놀룰루]3스타 금요일 불꽃놀이 셀레브레이션 픽업포함',
      en_label: 'STAR OF HONOLULU 3STAR FRIDAY CELEBRATION PICKUP'
    }
  ]
};

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
  is_main_client: false,
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

export const defaultVoucherValues = {
  confirmation_number: '',
  delivery_notes: '',
  guide_notes: '',
  selected_clients: [] as string[]
};

export const defaultCarVoucherValues = Object.fromEntries(
  Object.entries(defaultVoucherValues).filter(([key]) => key !== 'selected_clients')
) as Omit<typeof defaultVoucherValues, 'selected_clients'>;

export const HOTEL_GUIDE_NOTES = `* 호텔 룸 BED TYPE 은 당일 호텔 사정에 의해 1BED 또는 2BED 로 배정 받으실 수도 있습니다.
* 하와이의 모든 호텔은 BED TYPE 과 층수의 확정 예약이 불가 합니다.
* 체크인 시 예약자 본인임을 확인할 수 있는 여권과 본인 신용카드를 제시하셔야 합니다.
* 신용카드는 룸서비스 또는 디파짓(보증금)용 으로 사용됩니다.
* 모든 객실은 금연입니다. 흡연이 확인되면 벌금이 부과되며, 퇴실 당할 수 있습니다.
* 샤워가운이나 슬리퍼, 치약, 칫솔의 지급은 호텔마다 다릅니다.
* 체크아웃 시 객실키를 반납하시고 객실료외 기타 청구내역의 유무를 꼭 확인하시기 바랍니다.
* 전화기에 불이 깜빡이면 메시지가 저장되어 있습니다. 확인하시기 바랍니다.
* 메이드 팁은 객실당 1일 $2 정도 침대 위에 놓아 주시면 됩니다.`;

export const CAR_DELIVERY_NOTES = `* 운전자분의 여권, 한국면허증, 국제면허증, 운전자의 해외용 신용카드, 렌터카바우처 (5가지 미지참 시 인수불가)
* 위 준비물은 모두 여권상 영문성함과 스펠링이 같아야 하며, 트래블월렛/체크카드는 사용불가입니다.
* 렌터카 픽업 시 고객 서명 후 진행된 사항은 조인하와이에서 책임지지 않습니다. 
* 현지 변경은 불가하며, 전체 임차일 중 사용하지 않은 임차일의 비용은 환불되지 않습니다.
* 허츠렌터카 24시 응급 콜센터  (800) 654 5060`;

export const CAR_GUIDE_NOTES = `* Child Seat/Booster Seat등의 추가 장비는 현지결제 시 적용됩니다.(TAX + 제반비용별도) 
* 렌터카내에서는 금연입니다. 적발 시 $100 이상의 벌금이 부과됩니다.
* PICK UP 시간으로부터 30분이상 지나면 예약이 취소될 수 있습니다. 
  단, 공항 픽업 시 항공기 연착으로 인한 늦은 픽업은 예약이 유지됩니다.(항공스케줄 예약 시 기입 조건)
* 임차계약서 서명 시 내용을 꼭 확인하시고 영수증은 보관하셔야 합니다. 임차계약서 서명 후에는 변경이 불가합니다.
* 반납 시간을 어길 경우 추가 요금이 발생됩니다.
* 렌터카 대여는 24시간 기준입니다
* 본 바우처의 내용은 허츠렌터카 상황에 따라 예고없이 변경될 수 있습니다.`;

export const CAR_OFFICE_GUIDE_NOTES = `※ 영업소의 영업시간은 현지사정에 의해 예고없이 변경될 수 있습니다.
Honolulu Airport : AM05:30~AM24:00
Kahala Hotel and Resort : AM07:00~PM15:00 (호텔투숙객만 픽업/반납가능)
Hyatt Regency Waikiki (2F) : AM08:00~PM15:30 (영업시간 이후 반납 불가)
Imperial Hotel : AM07:00~PM15:00 (영업시간이후 무인반납은 호텔투숙객만 가능)
Kahului Airport Maui : AM05:30~PM23:00
Kona Keahole Airport : AM05:00~PM22:30
Hilo Airport : AM06:00~PM22:00
Lihue Airport : AM05:00~PM23:00`;

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
  resort_fee_type: RESORT_FEE_TYPE_LIST[0].value,
  nights: 1,
  nightly_rate: 0,
  cost: 0,
  remarks: '',
  rule: '',
  ...defaultVoucherValues,
  ...defaultProductValues,
  ...additionalOptions
};

export const defaultTourValues = {
  region: REGIONS[0],
  start_date: null,
  end_date: null,
  name: '',
  pickup_location: '',
  reception: 'PICK UP' as const,
  arrival_time: '00:00:00',
  arrival_location: '',
  liability_waiver_url: '',
  remarks: '',
  rule: '',
  voucher_number: '',
  ...defaultVoucherValues,
  ...defaultPeopleValues,
  ...defaultProductValues,
  ...additionalOptions
};

export type CarCompany = 'HERTZ' | 'DOLLAR';

export const defaultCarValues = {
  region: REGIONS[0],
  pickup_date: null,
  return_date: null,
  model: '',
  options: '',
  driver: '',
  company: 'HERTZ' as CarCompany,
  pickup_location: '',
  return_location: '',
  rental_days: 1,
  daily_rate: 0,
  cost: 0,
  remarks: '',
  rule: '',
  ...defaultCarVoucherValues,
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
  Refunded: 'blue',
  OnHold: 'yellow',
  Checked: 'blue'
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
