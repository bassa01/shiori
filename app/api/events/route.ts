import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { nanoid } from 'nanoid';

// GET /api/events?itineraryId=xxx - 特定のしおりに関連するイベントを取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itineraryId = searchParams.get('itineraryId');
    
    if (!itineraryId) {
      return NextResponse.json({ error: 'Itinerary ID is required' }, { status: 400 });
    }
    
    const rows = db.prepare(`
      SELECT 
        id, 
        itinerary_id as itineraryId, 
        title, 
        description, 
        location,
        event_date as eventDate,
        start_time as startTime, 
        end_time as endTime, 
        icon, 
        link, 
        order_index as orderIndex
      FROM events
      WHERE itinerary_id = ?
      ORDER BY event_date, startTime, order_index
    `).all(itineraryId);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events - 新しいイベントを作成
export async function POST(request: Request) {
  try {
    const event = await request.json();
    
    if (!event.itineraryId || !event.title) {
      return NextResponse.json({ error: 'Itinerary ID and title are required' }, { status: 400 });
    }
    
    const id = nanoid();
    
    db.prepare(`
      INSERT INTO events (id, itinerary_id, title, description, location, event_date, start_time, end_time, icon, link, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      event.itineraryId,
      event.title,
      event.description || null,
      event.location || null,
      event.eventDate || null,
      event.startTime || null,
      event.endTime || null,
      event.icon || null,
      event.link || null,
      event.orderIndex
    );
    
    const newEvent = db.prepare(`
      SELECT 
        id, 
        itinerary_id as itineraryId, 
        title, 
        description, 
        location,
        event_date as eventDate,
        start_time as startTime, 
        end_time as endTime, 
        icon, 
        link, 
        order_index as orderIndex
      FROM events
      WHERE id = ?
    `).get(id);
    
    return NextResponse.json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
