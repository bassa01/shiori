import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';

// GET /api/itineraries/export/[id] - しおりをJSONとしてエクスポート
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const { id } = routeParams;
    
    // しおりの情報を取得
    const itinerary = db.prepare(`
      SELECT 
        id, 
        title, 
        created_at as createdAt
      FROM itineraries
      WHERE id = ?
    `).get(id);
    
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }
    
    // しおりに関連するイベントを取得
    const events = db.prepare(`
      SELECT 
        id, 
        itinerary_id as itineraryId, 
        title, 
        description, 
        event_date as eventDate,
        start_time as startTime, 
        end_time as endTime, 
        icon, 
        link, 
        order_index as orderIndex
      FROM events
      WHERE itinerary_id = ?
      ORDER BY event_date, order_index
    `).all(id);
    
    // エクスポートデータを作成
    const exportData = {
      itinerary,
      events
    };
    
    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting itinerary:', error);
    return NextResponse.json({ error: 'Failed to export itinerary' }, { status: 500 });
  }
}
