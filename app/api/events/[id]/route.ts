import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

// GET /api/events/[id] - 特定のイベントを取得
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const { id } = routeParams;
    const row = db.prepare(`
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
    
    if (!row) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(row);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT /api/events/[id] - イベントを更新
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const { id } = routeParams;
    const event = await request.json();
    
    // 現在のイベントを取得
    const current = db.prepare(`
      SELECT 
        id, 
        itinerary_id as itineraryId
      FROM events
      WHERE id = ?
    `).get(id);
    
    if (!current) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const updates: string[] = [];
    const queryParams: any[] = [];
    
    if (event.title !== undefined) {
      updates.push('title = ?');
      queryParams.push(event.title);
    }
    
    if (event.description !== undefined) {
      updates.push('description = ?');
      queryParams.push(event.description || null);
    }
    
    if (event.location !== undefined) {
      updates.push('location = ?');
      queryParams.push(event.location || null);
    }
    
    if (event.eventDate !== undefined) {
      updates.push('event_date = ?');
      queryParams.push(event.eventDate || null);
    }
    
    if (event.startTime !== undefined) {
      updates.push('start_time = ?');
      queryParams.push(event.startTime || null);
    }
    
    if (event.endTime !== undefined) {
      updates.push('end_time = ?');
      queryParams.push(event.endTime || null);
    }
    
    if (event.icon !== undefined) {
      updates.push('icon = ?');
      queryParams.push(event.icon || null);
    }
    
    if (event.link !== undefined) {
      updates.push('link = ?');
      queryParams.push(event.link || null);
    }
    
    if (event.orderIndex !== undefined) {
      updates.push('order_index = ?');
      queryParams.push(event.orderIndex);
    }
    
    if (updates.length > 0) {
      queryParams.push(id);
      const query = `UPDATE events SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...queryParams);
    }
    
    const updated = db.prepare(`
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
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/events/[id] - イベントを削除
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const { id } = routeParams;
    const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
