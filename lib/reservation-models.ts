// 予約情報の管理モデル
export interface Reservation {
  id: string;
  eventId: string;
  itineraryId: string;
  type: ReservationType;
  status: ReservationStatus;
  confirmationNumber?: string;
  provider?: string;
  bookingDate?: string;
  price?: number;
  currency?: string;
  notes?: string;
  contactInfo?: string;
  attachmentUrls?: string[];
  createdAt: number;
  updatedAt: number;
}

// 予約タイプ
export type ReservationType = 
  | 'flight'       // 航空券
  | 'hotel'        // ホテル
  | 'rentalCar'    // レンタカー
  | 'activity'     // アクティビティ
  | 'restaurant'   // レストラン
  | 'train'        // 電車
  | 'bus'          // バス
  | 'ferry'        // フェリー
  | 'other';       // その他

// 予約ステータス
export type ReservationStatus = 
  | 'notBooked'    // 未予約
  | 'pending'      // 予約中/確認待ち
  | 'confirmed'    // 予約確定
  | 'paid'         // 支払い済み
  | 'cancelled'    // キャンセル済み
  | 'completed';   // 完了

// 予約タイプの定義
export const RESERVATION_TYPES = [
  { id: 'flight', name: '航空券', icon: 'plane' },
  { id: 'hotel', name: 'ホテル', icon: 'hotel' },
  { id: 'rentalCar', name: 'レンタカー', icon: 'car' },
  { id: 'activity', name: 'アクティビティ', icon: 'hiking' },
  { id: 'restaurant', name: 'レストラン', icon: 'utensils' },
  { id: 'train', name: '電車', icon: 'train' },
  { id: 'bus', name: 'バス', icon: 'bus' },
  { id: 'ferry', name: 'フェリー', icon: 'ship' },
  { id: 'other', name: 'その他', icon: 'ticket' },
];

// 予約ステータスの定義
export const RESERVATION_STATUSES = [
  { id: 'notBooked', name: '未予約', color: 'gray' },
  { id: 'pending', name: '予約中/確認待ち', color: 'yellow' },
  { id: 'confirmed', name: '予約確定', color: 'green' },
  { id: 'paid', name: '支払い済み', color: 'blue' },
  { id: 'cancelled', name: 'キャンセル済み', color: 'red' },
  { id: 'completed', name: '完了', color: 'purple' },
];
