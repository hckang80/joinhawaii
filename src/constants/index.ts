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
    { value: '클룩', label: '클룩' },
    { value: '트리플', label: '트리플' }
  ]
};

export const TOURS = ['공항셔틀', '일주관광', '해양스포츠', '액티비티', '스냅', '기타'] as const;
export type Tour = (typeof TOURS)[number] | (string & {});
export const TOURS_OPTIONS: Record<Tour, GroupSelectOption[]> = {
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
      value: '[일일관광]빅아일랜드 와이키키픽업',
      label: '[일일관광]빅아일랜드 와이키키픽업',
      en_label: 'ONE DAY BIGISLAND TOUR WAIKIKI'
    },
    {
      value: '[ 일일관광]빅아일랜드 코나/힐로픽업',
      label: '[ 일일관광]빅아일랜드 코나/힐로픽업',
      en_label: 'ONE DAY BIGISLAND TOUR KONA/HILLO'
    },
    {
      value: '[일일관광]마우이',
      label: '[일일관광]마우이',
      en_label: 'ONE DAY MAUI TOUR'
    },
    {
      value: '[일일관광]카우아이',
      label: '[일일관광]카우아이',
      en_label: 'ONE DAY KAUAI TOUR'
    }
  ],
  해양스포츠: [
    { value: '돌핀 앤 유', label: '돌핀 앤 유', en_label: 'DOLPHINE AND YOU' },
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
      en_label: 'BIGISLAND BLUE HAWAIIAN HELLCOPTER DISCOVER HILO'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 HILO WATERFALL EXPERIENCE',
      label: '[블루 하와이안 헬기투어]빅아일랜드 HILO WATERFALL EXPERIENCE',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELLCOPTER HILO WATERFALL EXPERIENCE'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA BIG ISLAND SPECTACULAR',
      label: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA BIG ISLAND SPECTACULAR',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELLCOPTER WAIKOLOA BIG ISLAND SPECTACULAR'
    },
    {
      value: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA KOHALA COAST ADVENTURE',
      label: '[블루 하와이안 헬기투어]빅아일랜드 WAIKOLOA KOHALA COAST ADVENTURE',
      en_label: 'BIGISLAND BLUE HAWAIIAN HELLCOPTER WAIKOLOA KOHALA COAST ADVENTURE'
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
      en_label: 'KUALOA RANCH UTV R'
    },
    {
      value: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업포함',
      label: '[쿠알로아랜치]UTV 어드벤처 2시간 가이드운전 픽업포함',
      en_label: 'KUALOA RANCH UTV R GUIDE PICKUP'
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
