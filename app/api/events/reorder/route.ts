import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

// POST /api/events/reorder - イベントの順序を更新
export async function POST(request: Request) {
  try {
    const { itineraryId, eventIds } = await request.json();
    
    if (!itineraryId || !eventIds || !Array.isArray(eventIds)) {
      return NextResponse.json({ error: 'Itinerary ID and event IDs array are required' }, { status: 400 });
    }
    
    db.transaction(() => {
      eventIds.forEach((id, index) => {
        db.prepare('UPDATE events SET order_index = ? WHERE id = ? AND itinerary_id = ?')
          .run(index, id, itineraryId);
      });
    });
    
    const events = db.prepare(`
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
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error reordering events:', error);
    return NextResponse.json({ error: 'Failed to reorder events' }, { status: 500 });
  }
}
