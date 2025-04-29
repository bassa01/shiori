import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { nanoid } from 'nanoid';

// GET /api/budgets?itineraryId=xxx
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

    // Get all budgets for the itinerary
    const budgets = db.prepare(`
      SELECT 
        id, 
        itinerary_id as itineraryId, 
        category, 
        name, 
        amount, 
        notes, 
        event_id as eventId, 
        order_index as orderIndex 
      FROM budgets 
      WHERE itinerary_id = ? 
      ORDER BY order_index
    `).all(itineraryId);

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

// POST /api/budgets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itineraryId, category, name, amount, notes, eventId } = body;

    if (!itineraryId || !category || !name || amount === undefined) {
      return NextResponse.json({ error: 'itineraryId, category, name, and amount are required' }, { status: 400 });
    }

    // Check if itinerary exists
    const itinerary = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(itineraryId);
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    // Check if event exists if eventId is provided
    if (eventId) {
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
    }

    // Get the highest order index
    const maxOrderResult = db.prepare(
      'SELECT MAX(order_index) as maxOrder FROM budgets WHERE itinerary_id = ?'
    ).get(itineraryId);
    
    const orderIndex = maxOrderResult && maxOrderResult.maxOrder !== null 
      ? maxOrderResult.maxOrder + 1 
      : 0;

    const id = nanoid();
    
    // Insert new budget
    db.prepare(`
      INSERT INTO budgets (
        id, 
        itinerary_id, 
        category, 
        name, 
        amount, 
        notes, 
        event_id, 
        order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, 
      itineraryId, 
      category, 
      name, 
      amount, 
      notes || null, 
      eventId || null, 
      orderIndex
    );

    // Return the created budget
    const createdBudget = db.prepare(`
      SELECT 
        id, 
        itinerary_id as itineraryId, 
        category, 
        name, 
        amount, 
        notes, 
        event_id as eventId, 
        order_index as orderIndex 
      FROM budgets 
      WHERE id = ?
    `).get(id);

    return NextResponse.json(createdBudget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
