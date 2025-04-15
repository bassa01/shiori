export interface Itinerary {
  id: string;
  title: string;
  createdAt: number;
  totalBudget?: number; // 旅行全体の予算
  currency?: string;   // 通貨単位（例：JPY, USD）
}

export interface Event {
  id: string;
  itineraryId: string;
  title: string;
  description?: string;
  location?: string; // イベントの場所・住所
  latitude?: number | null; // 緯度情報
  longitude?: number | null; // 経度情報
  eventDate?: string; // イベントの日付（YYYY-MM-DD形式）
  startTime?: string;
  endTime?: string;
  icon?: string;
  link?: string;
  orderIndex: number;
}

export interface PackingItem {
  id: string;
  itineraryId: string;
  name: string;
  category: string; // カテゴリ（例：衣類、電子機器、トイレタリーなど）
  isPacked: boolean;
  quantity: number;
  notes?: string;
  isEssential: boolean; // 必須アイテムかどうか
  orderIndex: number;
}

export type PackingCategory = {
  id: string;
  name: string;
  icon: string;
};

// 定義済みのパッキングカテゴリー
export const PACKING_CATEGORIES: PackingCategory[] = [
  { id: 'clothing', name: '衣類', icon: 'shirt' },
  { id: 'toiletries', name: 'トイレタリー', icon: 'bath' },
  { id: 'electronics', name: '電子機器', icon: 'laptop' },
  { id: 'documents', name: '書類', icon: 'file' },
  { id: 'medicine', name: '薬・医療品', icon: 'pill' },
  { id: 'accessories', name: '小物・アクセサリー', icon: 'ring' },
  { id: 'food', name: '食品・飲料', icon: 'utensils' },
  { id: 'other', name: 'その他', icon: 'box' },
];

// 予算カテゴリー
export type BudgetCategory = {
  id: string;
  name: string;
  icon: string;
};

// 定義済みの予算カテゴリー
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'transportation', name: '交通費', icon: 'car' },
  { id: 'accommodation', name: '宿泊費', icon: 'hotel' },
  { id: 'food', name: '食費', icon: 'utensils' },
  { id: 'activities', name: 'アクティビティ', icon: 'hiking' },
  { id: 'shopping', name: 'ショッピング', icon: 'shopping-bag' },
  { id: 'other', name: 'その他', icon: 'receipt' },
];

// 予算モデル
export interface Budget {
  id: string;
  itineraryId: string;
  category: string;       // カテゴリー（交通費、宿泊費など）
  name: string;           // 予算名（例：「ホテルA」「新幹線」など）
  amount: number;         // 予算額
  notes?: string;         // メモ
  eventId?: string;       // 関連するイベントID（オプション）
  orderIndex: number;     // 表示順
}

// 支出モデル
export interface Expense {
  id: string;
  budgetId: string;       // 関連する予算ID
  itineraryId: string;    // 旅程ID
  date: string;           // 支出日（YYYY-MM-DD形式）
  amount: number;         // 支出額
  description: string;    // 説明
  category: string;       // カテゴリー（予算カテゴリーと同じ）
  paymentMethod?: string; // 支払い方法（現金、クレジットカードなど）
  receiptImage?: string;  // 領収書画像（オプション）
  createdAt: number;      // 作成日時
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

// 予約情報
export interface Reservation {
  id: string;
  eventId: string;           // 関連するイベントID
  itineraryId: string;       // 旅程ID
  type: ReservationType;     // 予約タイプ
  status: ReservationStatus; // 予約ステータス
  confirmationNumber?: string; // 予約番号 (Optional)
  provider?: string;          // 予約提供者（航空会社、ホテル名など） (Optional)
  bookingDate?: string;       // 予約日 (Optional)
  price?: number;             // 価格 (Changed to number | undefined)
  currency?: string;          // 通貨 (Optional)
  notes?: string;             // メモ (Optional)
  contactInfo?: string;       // 連絡先情報 (Optional)
  attachmentUrls?: string[];  // 添付ファイルURL (Optional)
  createdAt: number;         // 作成日時
  updatedAt: number;         // 更新日時
}

// 定数定義
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

export const RESERVATION_STATUSES = [
  { id: 'notBooked', name: '未予約', color: 'gray' },
  { id: 'pending', name: '確認待ち', color: 'yellow' },
  { id: 'confirmed', name: '予約確定', color: 'blue' },
  { id: 'paid', name: '支払い済み', color: 'green' },
  { id: 'cancelled', name: 'キャンセル', color: 'red' },
  { id: 'completed', name: '完了', color: 'purple' },
];

// データベース内の予約スキーマ（スネークケース）
export interface DbReservation {
  id: string;
  event_id: string;
  itinerary_id: string;
  type: ReservationType;
  status: ReservationStatus;
  confirmation_number: string;
  provider: string;
  booking_date: string;
  price: string;
  currency: string;
  notes: string;
  contact_info: string;
  attachment_urls: string | null; // JSONとして保存されている文字列
  created_at: number;
  updated_at: number;
}
