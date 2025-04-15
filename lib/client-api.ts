import { Itinerary, Event, PackingItem, Budget, Expense, Reservation } from './models';
import { TravelMode } from './route-api';

// Define the structure for exported data
interface ExportData {
  itinerary: Itinerary;
  events: Event[];
  packingItems: PackingItem[];
  budget?: Budget; // Optional as budget might not exist
  expenses?: Expense[]; // Optional as expenses might not exist
}

// Itinerary API
export async function fetchItineraries(): Promise<Itinerary[]> {
  const response = await fetch('/api/itineraries');
  if (!response.ok) {
    throw new Error('Failed to fetch itineraries');
  }
  return response.json();
}

export async function fetchItinerary(id: string): Promise<Itinerary> {
  const response = await fetch(`/api/itineraries/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch itinerary');
  }
  return response.json();
}

export async function createItinerary(data: Partial<Itinerary>): Promise<Itinerary> {
  const response = await fetch('/api/itineraries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create itinerary');
  }
  
  return response.json();
}

export async function updateItinerary(id: string, title: string): Promise<Itinerary> {
  const response = await fetch(`/api/itineraries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update itinerary');
  }
  
  return response.json();
}

export async function deleteItinerary(id: string): Promise<void> {
  const response = await fetch(`/api/itineraries/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete itinerary');
  }
}

// Event API
export async function fetchEvents(itineraryId: string): Promise<Event[]> {
  const response = await fetch(`/api/events?itineraryId=${itineraryId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
}

export async function fetchEvent(id: string): Promise<Event> {
  const response = await fetch(`/api/events/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
}

export async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  
  return response.json();
}

export async function updateEvent(id: string, event: Partial<Omit<Event, 'id' | 'itineraryId'>>): Promise<Event> {
  const response = await fetch(`/api/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update event');
  }
  
  return response.json();
}

export async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`/api/events/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
}

export async function reorderEvents(itineraryId: string, eventIds: string[]): Promise<Event[]> {
  const response = await fetch('/api/events/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ itineraryId, eventIds }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to reorder events');
  }
  
  return response.json();
}

// エクスポート・インポート機能
export async function exportItinerary(id: string): Promise<ExportData> {
  const response = await fetch(`/api/itineraries/export/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to export itinerary');
  }
  
  return await response.json() as ExportData; // Explicitly type the response
}

export async function importItinerary(data: Record<string, unknown>): Promise<{ id: string }> {
  const response = await fetch('/api/itineraries/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to import itinerary' }));
    throw new Error(errorData.message || 'Failed to import itinerary');
  }

  // サーバーが返すJSON { id: string }
  return await response.json();
}

export async function updateItineraryBudget(id: string, totalBudget: number, currency?: string): Promise<Itinerary> {
  try {
    console.log('Updating itinerary budget:', { id, totalBudget, currency });
    
    const response = await fetch(`/api/itineraries/${id}/budget`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ totalBudget, currency }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Budget update error response:', errorData);
      throw new Error(`旅程の予算更新に失敗しました: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating itinerary budget:', error);
    throw error;
  }
}

// OpenRouteService API
export async function calculateTravelTime(
  origin: string,
  destination: string,
  mode: TravelMode = TravelMode.driving
): Promise<{ 
  duration: number; 
  distance: number; 
  durationText: string; 
  distanceText: string; 
  originAddress: string;
  destinationAddress: string;
}> {
  const response = await fetch(
    `/api/maps/travel-time?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}`
  );
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '移動時間の計算に失敗しました');
  }
  
  return response.json();
}

// パッキングリスト API
export async function fetchPackingItems(itineraryId: string): Promise<PackingItem[]> {
  const response = await fetch(`/api/packing-items?itineraryId=${itineraryId}`);
  if (!response.ok) {
    throw new Error('パッキングアイテムの取得に失敗しました');
  }
  return response.json();
}

export async function fetchPackingItem(id: string): Promise<PackingItem> {
  const response = await fetch(`/api/packing-items/${id}`);
  if (!response.ok) {
    throw new Error('パッキングアイテムの取得に失敗しました');
  }
  return response.json();
}

export async function createPackingItem(item: Omit<PackingItem, 'id'>): Promise<PackingItem> {
  const response = await fetch('/api/packing-items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  
  if (!response.ok) {
    throw new Error('パッキングアイテムの作成に失敗しました');
  }
  
  return response.json();
}

export async function updatePackingItem(id: string, updateData: Partial<PackingItem>): Promise<PackingItem> {
  const response = await fetch(`/api/packing-items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    throw new Error('パッキングアイテムの更新に失敗しました');
  }
  
  return response.json();
}

export async function deletePackingItem(id: string): Promise<void> {
  const response = await fetch(`/api/packing-items/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('パッキングアイテムの削除に失敗しました');
  }
}

export async function reorderPackingItems(itineraryId: string, itemIds: string[]): Promise<PackingItem[]> {
  const response = await fetch('/api/packing-items/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ itineraryId, itemIds }),
  });
  
  if (!response.ok) {
    throw new Error('パッキングアイテムの並び替えに失敗しました');
  }
  
  return response.json();
}

export async function togglePackedStatus(id: string, isPacked: boolean): Promise<PackingItem> {
  return updatePackingItem(id, { isPacked });
}

export async function updateMultiplePackingItems(items: Array<{ id: string; data: Partial<PackingItem> }>): Promise<PackingItem[]> {
  const response = await fetch(`/api/packing-items/batch`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(items),
  });
  
  if (!response.ok) {
    throw new Error('パッキングアイテムの更新に失敗しました');
  }
  
  return response.json();
}

// 予約管理 API
export async function fetchReservations(itineraryId: string): Promise<Reservation[]> {
  try {
    const response = await fetch(`/api/reservations?itineraryId=${itineraryId}`);
    if (!response.ok) {
      throw new Error('予約情報の取得に失敗しました');
    }
    return await response.json() as Reservation[];
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
}

export async function fetchEventReservation(eventId: string): Promise<Reservation | null> {
  try {
    const response = await fetch(`/api/reservations?eventId=${eventId}`);
    if (!response.ok) {
      throw new Error('イベントの予約取得に失敗しました');
    }
    const reservations = await response.json();
    return reservations.length > 0 ? reservations[0] : null;
  } catch (error) {
    console.error('イベントの予約取得エラー:', error);
    return null;
  }
}

export async function createReservation(reservationData: Partial<Reservation>): Promise<Reservation> {
  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reservationData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '予約の作成に失敗しました');
  }
  
  return response.json();
}

export async function updateReservation(id: string, reservationData: Partial<Reservation>): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reservationData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '予約の更新に失敗しました');
  }
  
  return response.json();
}

export async function deleteReservation(id: string): Promise<void> {
  const response = await fetch(`/api/reservations/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '予約の削除に失敗しました');
  }
}

// 予算管理 API
export async function fetchBudgets(itineraryId: string): Promise<Budget[]> {
  const response = await fetch(`/api/budgets?itineraryId=${itineraryId}`);
  if (!response.ok) {
    throw new Error('予算の取得に失敗しました');
  }
  return response.json();
}

export async function fetchBudget(id: string): Promise<Budget> {
  const response = await fetch(`/api/budgets/${id}`);
  if (!response.ok) {
    throw new Error('予算の取得に失敗しました');
  }
  return response.json();
}

export async function createBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
  const response = await fetch('/api/budgets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(budget),
  });
  
  if (!response.ok) {
    throw new Error('予算の作成に失敗しました');
  }
  
  return response.json();
}

export async function updateBudget(id: string, budget: Partial<Omit<Budget, 'id' | 'itineraryId'>>): Promise<Budget> {
  const response = await fetch(`/api/budgets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(budget),
  });
  
  if (!response.ok) {
    throw new Error('予算の更新に失敗しました');
  }
  
  return response.json();
}

export async function deleteBudget(id: string): Promise<void> {
  const response = await fetch(`/api/budgets/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('予算の削除に失敗しました');
  }
}

// 支出管理 API
export async function fetchExpenses(itineraryId: string, budgetId?: string): Promise<Expense[]> {
  const url = budgetId 
    ? `/api/expenses?itineraryId=${itineraryId}&budgetId=${budgetId}`
    : `/api/expenses?itineraryId=${itineraryId}`;
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('支出の取得に失敗しました');
  }
  return response.json();
}

export async function fetchExpense(id: string): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`);
  if (!response.ok) {
    throw new Error('支出の取得に失敗しました');
  }
  return response.json();
}

export async function createExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  });
  
  if (!response.ok) {
    throw new Error('支出の作成に失敗しました');
  }
  
  return response.json();
}

export async function updateExpense(id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  });
  
  if (!response.ok) {
    throw new Error('支出の更新に失敗しました');
  }
  
  return response.json();
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('支出の削除に失敗しました');
  }
}
