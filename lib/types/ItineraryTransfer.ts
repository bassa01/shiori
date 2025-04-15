// Types for import/export of itineraries

export interface TransferItinerary {
  id?: string;
  title: string;
  createdAt?: number | string | Date;
  totalBudget?: number;
  currency?: string;
}

export interface TransferEvent {
  id?: string;
  itineraryId?: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  eventDate?: string | number | Date;
  startTime?: string;
  endTime?: string;
  icon?: string;
  link?: string;
  orderIndex?: number;
  // Add any other fields needed for full round-trip
}

export interface TransferExpense {
  id?: string;
  itineraryId?: string;
  description?: string;
  amount?: number;
  category?: string;
  expenseDate?: number | string | Date;
} // Always use expenseDate

export interface TransferPackingItem {
  id?: string;
  itineraryId?: string;
  name?: string;
  quantity?: number;
  checked?: boolean; // Use for import (maps to isPacked)
  isPacked?: boolean; // Use for export (maps to checked)
}

export interface ItineraryTransferData {
  itinerary: TransferItinerary;
  events: TransferEvent[];
  expenses: TransferExpense[];
  packingItems: TransferPackingItem[];
}
