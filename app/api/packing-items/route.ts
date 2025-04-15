import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '../../../lib/db';
import { PackingItem } from '../../../lib/models';

// GET /api/packing-items?itineraryId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itineraryId = searchParams.get('itineraryId');

    if (!itineraryId) {
      return NextResponse.json({ error: 'itineraryId is required' }, { status: 400 });
    }

    // Check if itinerary exists
    const itinerary = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(itineraryId);
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    // Get all packing items for the itinerary
    const items = db.prepare(`
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

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching packing items:', error);
    return NextResponse.json({ error: 'Failed to fetch packing items' }, { status: 500 });
  }
}

// POST /api/packing-items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itineraryId, name, category, isPacked, quantity, notes, isEssential } = body;

    if (!itineraryId || !name || !category) {
      return NextResponse.json({ error: 'itineraryId, name, and category are required' }, { status: 400 });
    }

    // Check if itinerary exists
    const itinerary = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(itineraryId);
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    // Get the highest order index
    const maxOrderResult = db.prepare(
      'SELECT MAX(order_index) as maxOrder FROM packing_items WHERE itinerary_id = ?'
    ).get(itineraryId);
    
    const orderIndex = maxOrderResult && maxOrderResult.maxOrder !== null 
      ? maxOrderResult.maxOrder + 1 
      : 0;

    const id = uuidv4();
    
    // Insert new packing item
    db.prepare(`
      INSERT INTO packing_items (
        id, 
        itinerary_id, 
        name, 
        category, 
        is_packed, 
        quantity, 
        notes, 
        is_essential, 
        order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, 
      itineraryId, 
      name, 
      category, 
      isPacked ? 1 : 0, 
      quantity || 1, 
      notes || null, 
      isEssential ? 1 : 0, 
      orderIndex
    );

    // Return the created item
    const createdItem = db.prepare(`
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
      WHERE id = ?
    `).get(id);

    return NextResponse.json(createdItem, { status: 201 });
  } catch (error) {
    console.error('Error creating packing item:', error);
    return NextResponse.json({ error: 'Failed to create packing item' }, { status: 500 });
  }
}
