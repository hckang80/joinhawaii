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
  local_currency: number;
  [key: string]: unknown;
}

export type ProductType = 'flight' | 'hotel' | 'tour' | 'rental_car';

export interface UpdateProductStatusParams {
  reservation_id: string;
  product_type: ProductType;
  product_id: number;
  status: ProductStatus;
}
