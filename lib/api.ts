import { nanoid } from 'nanoid';
import db from './db';
import { Itinerary, Event } from './models';

// Itinerary API
export function createItinerary(title: string): Itinerary {
  const id = nanoid();
  const createdAt = Date.now();
  
  db.prepare('INSERT INTO itineraries (id, title, created_at) VALUES (?, ?, ?)')
    .run(id, title, createdAt);
    
  return {
    id,
    title,
    createdAt
  };
}

export function getItineraries(): Itinerary[] {
  const rows = db.prepare('SELECT id, title, created_at as createdAt FROM itineraries ORDER BY created_at DESC').all();
  return rows as Itinerary[];
}

export function getItinerary(id: string): Itinerary | null {
  const row = db.prepare('SELECT id, title, created_at as createdAt FROM itineraries WHERE id = ?').get(id);
  return row as Itinerary || null;
}

export function updateItinerary(id: string, title: string): Itinerary | null {
  db.prepare('UPDATE itineraries SET title = ? WHERE id = ?').run(title, id);
  return getItinerary(id);
}

export function deleteItinerary(id: string): void {
  db.prepare('DELETE FROM itineraries WHERE id = ?').run(id);
}

// Event API
export function createEvent(event: Omit<Event, 'id'>): Event {
  const id = nanoid();
  
  db.prepare(`
    INSERT INTO events (id, itinerary_id, title, description, start_time, end_time, icon, link, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    event.itineraryId,
    event.title,
    event.description || null,
    event.startTime || null,
    event.endTime || null,
    event.icon || null,
    event.link || null,
    event.orderIndex
  );
  
  return {
    id,
    ...event
  };
}

export function getEvents(itineraryId: string): Event[] {
  const rows = db.prepare(`
    SELECT 
      id, 
      itinerary_id as itineraryId, 
      title, 
      description, 
      start_time as startTime, 
      end_time as endTime, 
      icon, 
      link, 
      order_index as orderIndex
    FROM events
    WHERE itinerary_id = ?
    ORDER BY order_index
  `).all(itineraryId);
  
  return rows as Event[];
}

export function getEvent(id: string): Event | null {
  const row = db.prepare(`
    SELECT 
      id, 
      itinerary_id as itineraryId, 
      title, 
      description, 
      start_time as startTime, 
      end_time as endTime, 
      icon, 
      link, 
      order_index as orderIndex
    FROM events
    WHERE id = ?
  `).get(id);
  
  return row as Event || null;
}

export function updateEvent(id: string, event: Partial<Omit<Event, 'id' | 'itineraryId'>>): Event | null {
  const current = getEvent(id);
  if (!current) return null;
  
  const updates: string[] = [];
  const params: unknown[] = [];
  
  if (event.title !== undefined) {
    updates.push('title = ?');
    params.push(event.title);
  }
  
  if (event.description !== undefined) {
    updates.push('description = ?');
    params.push(event.description || null);
  }
  
  if (event.startTime !== undefined) {
    updates.push('start_time = ?');
    params.push(event.startTime || null);
  }
  
  if (event.endTime !== undefined) {
    updates.push('end_time = ?');
    params.push(event.endTime || null);
  }
  
  if (event.icon !== undefined) {
    updates.push('icon = ?');
    params.push(event.icon || null);
  }
  
  if (event.link !== undefined) {
    updates.push('link = ?');
    params.push(event.link || null);
  }
  
  if (event.orderIndex !== undefined) {
    updates.push('order_index = ?');
    params.push(event.orderIndex);
  }
  
  if (updates.length > 0) {
    params.push(id);
    const query = `UPDATE events SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...params);
  }
  
  return getEvent(id);
}

export function deleteEvent(id: string): void {
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
}

export function reorderEvents(itineraryId: string, eventIds: string[]): Event[] {
  db.transaction(() => {
    eventIds.forEach((id, index) => {
      db.prepare('UPDATE events SET order_index = ? WHERE id = ? AND itinerary_id = ?')
        .run(index, id, itineraryId);
    });
  });

  return getEvents(itineraryId);
}
