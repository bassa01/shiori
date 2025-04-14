import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { nanoid } from 'nanoid';

// POST /api/itineraries/import - JSONからしおりをインポート
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.itinerary || !data.events) {
      return NextResponse.json({ error: 'Invalid import data format' }, { status: 400 });
    }
    
    // トランザクションを開始
    const result = db.transaction(() => {
      // 新しいしおりIDを生成
      const newItineraryId = nanoid();
      
      // しおりを作成
      db.prepare('INSERT INTO itineraries (id, title, created_at) VALUES (?, ?, ?)')
        .run(
          newItineraryId,
          data.itinerary.title,
          Date.now() // 新しい作成日時を設定
        );
      
      // イベントをインポート
      data.events.forEach((event: any, index: number) => {
        const newEventId = nanoid();
        
        db.prepare(`
          INSERT INTO events (
            id, 
            itinerary_id, 
            title, 
            description, 
            event_date, 
            start_time, 
            end_time, 
            icon, 
            link, 
            order_index
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newEventId,
          newItineraryId,
          event.title,
          event.description || null,
          event.eventDate || null,
          event.startTime || null,
          event.endTime || null,
          event.icon || null,
          event.link || null,
          index // 順番を保持
        );
      });
      
      return { id: newItineraryId };
    })();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error importing itinerary:', error);
    return NextResponse.json({ error: 'Failed to import itinerary' }, { status: 500 });
  }
}
