import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';

// GET /api/budgets/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Get the budget
    const budget = db.prepare(`
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

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
  }
}

// PUT /api/budgets/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { category, name, amount, notes, eventId } = body;

    // Check if the budget exists
    const existingBudget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Check if event exists if eventId is provided
    if (eventId) {
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
    }

    // Build the update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (amount !== undefined) {
      updateFields.push('amount = ?');
      updateValues.push(amount);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }

    if (eventId !== undefined) {
      updateFields.push('event_id = ?');
      updateValues.push(eventId);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add the ID to the values array
    updateValues.push(id);

    // Update the budget
    db.prepare(`
      UPDATE budgets 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `).run(...updateValues);

    // Return the updated budget
    const updatedBudget = db.prepare(`
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

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

// DELETE /api/budgets/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if the budget exists
    const existingBudget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Delete the budget
    db.prepare('DELETE FROM budgets WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
