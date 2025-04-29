import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';

// POST /api/packing-items/reorder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itineraryId, itemIds } = body;

    if (!itineraryId || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: 'itineraryId and itemIds array are required' }, { status: 400 });
    }

    // Check if itinerary exists
    const itinerary = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(itineraryId);
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    // Update order indexes in a transaction
    db.transaction(() => {
      itemIds.forEach((id, index) => {
        db.prepare('UPDATE packing_items SET order_index = ? WHERE id = ? AND itinerary_id = ?')
          .run(index, id, itineraryId);
      });
    });

    // Get the updated items
    const updatedItems = db.prepare(`
      SELECT 
        id, 
        itinerary_id as itineraryId, 
        name, 
        category, 
        is_packed as isPacked, 
        quantity, 
        notes, 
        is_essential as isEssential, 
        order_index as orderIndex 
      FROM packing_items 
      WHERE itinerary_id = ? 
      ORDER BY order_index
    `).all(itineraryId);

    return NextResponse.json(updatedItems);
  } catch (error) {
    console.error('Error reordering packing items:', error);
    return NextResponse.json({ error: 'Failed to reorder packing items' }, { status: 500 });
  }
}
