export interface Itinerary {
  id: string;
  title: string;
  createdAt: number;
}

export interface Event {
  id: string;
  itineraryId: string;
  title: string;
  description?: string;
  location?: string; // イベントの場所・住所
  eventDate?: string; // イベントの日付（YYYY-MM-DD形式）
  startTime?: string;
  endTime?: string;
  icon?: string;
  link?: string;
  orderIndex: number;
}
