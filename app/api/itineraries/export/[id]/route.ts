import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';
import type { ItineraryTransferData } from '../../../../../lib/types/ItineraryTransfer';

// GET /api/itineraries/export/[id] - しおりをJSONとしてエクスポート
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const { id } = routeParams;
    console.log('[EXPORT] itineraryId:', id);
    
    // しおりの情報を取得
    const itinerary = db.prepare(`
      SELECT 
        id, 
        title, 
        created_at as createdAt,
        totalBudget,
        currency
      FROM itineraries
      WHERE id = ?
    `).get(id);
    console.log('[EXPORT] itinerary:', itinerary);
    
    if (!itinerary) {
      console.error('[EXPORT] Itinerary not found:', id);
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }
    
    // しおりに関連するイベントを取得
    const events = db.prepare(`
      SELECT 
        id, 
        itinerary_id as itineraryId, 
        title, 
        description, 
        location,
        latitude,
        longitude,
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
    console.log('[EXPORT] events:', events.length);
    
    // 費用項目を取得
    const expenses = db.prepare(`
      SELECT
        id,
        itinerary_id as itineraryId,
        description,
        amount,
        category,
        date as expenseDate
      FROM expenses
      WHERE itinerary_id = ?
    `).all(id);
    console.log('[EXPORT] expenses:', expenses.length);

    // 持ち物リストを取得
    const packingItems = db.prepare(`
      SELECT
        id,
        itinerary_id as itineraryId,
        name,
        quantity,
        is_packed as isPacked
      FROM packing_items
      WHERE itinerary_id = ?
    `).all(id);
    console.log('[EXPORT] packingItems:', packingItems.length);
    
    // エクスポートデータを作成
    const exportData: ItineraryTransferData = {
      itinerary,
      events,
      expenses,
      packingItems
    };
    console.log('[EXPORT] Success');
    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting itinerary:', error);
    return NextResponse.json({ error: 'Failed to export itinerary' }, { status: 500 });
  }
}
