import { Itinerary, Event } from './models';
import { TravelMode } from './route-api';

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

export async function createItinerary(title: string): Promise<Itinerary> {
  const response = await fetch('/api/itineraries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
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
export async function exportItinerary(id: string): Promise<any> {
  const response = await fetch(`/api/itineraries/export/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to export itinerary');
  }
  
  return response.json();
}

export async function importItinerary(data: any): Promise<{ id: string }> {
  const response = await fetch('/api/itineraries/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to import itinerary');
  }
  
  return response.json();
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
