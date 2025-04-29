import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import db from '../../../lib/db';

// GET /api/expenses?itineraryId=xxx&budgetId=yyy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itineraryId = searchParams.get('itineraryId');
    const budgetId = searchParams.get('budgetId');

    if (!itineraryId) {
      return NextResponse.json({ error: 'itineraryId is required' }, { status: 400 });
    }

    // Check if itinerary exists
    const itinerary = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(itineraryId);
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    // Build the query based on whether budgetId is provided
    let query = `
      SELECT 
        id, 
        budget_id as budgetId, 
        itinerary_id as itineraryId, 
        date, 
        amount, 
        description, 
        category, 
        payment_method as paymentMethod, 
        receipt_image as receiptImage, 
        created_at as createdAt 
      FROM expenses 
      WHERE itinerary_id = ? 
    `;
    
    const queryParams = [itineraryId];
    
    if (budgetId) {
      query += 'AND budget_id = ? ';
      queryParams.push(budgetId);
    }
    
    query += 'ORDER BY date DESC, created_at DESC';
    
    // Get expenses
    const expenses = db.prepare(query).all(...queryParams);

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

// POST /api/expenses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { budgetId, itineraryId, date, amount, description, category, paymentMethod, receiptImage } = body;

    if (!budgetId || !itineraryId || !date || amount === undefined || !description || !category) {
      return NextResponse.json({ 
        error: 'budgetId, itineraryId, date, amount, description, and category are required' 
      }, { status: 400 });
    }

    // Check if itinerary exists
    const itinerary = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(itineraryId);
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    // Check if budget exists
    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(budgetId);
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    const id = nanoid();
    const createdAt = Date.now();
    
    // Insert new expense
    db.prepare(`
      INSERT INTO expenses (
        id, 
        budget_id, 
        itinerary_id, 
        date, 
        amount, 
        description, 
        category, 
        payment_method, 
        receipt_image, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, 
      budgetId, 
      itineraryId, 
      date, 
      amount, 
      description, 
      category, 
      paymentMethod || null, 
      receiptImage || null, 
      createdAt
    );

    // Return the created expense
    const createdExpense = db.prepare(`
      SELECT 
        id, 
        budget_id as budgetId, 
        itinerary_id as itineraryId, 
        date, 
        amount, 
        description, 
        category, 
        payment_method as paymentMethod, 
        receipt_image as receiptImage, 
        created_at as createdAt 
      FROM expenses 
      WHERE id = ?
    `).get(id);

    return NextResponse.json(createdExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
