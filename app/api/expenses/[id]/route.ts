import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';

// GET /api/expenses/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Get the expense
    const expense = db.prepare(`
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

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
  }
}

// PUT /api/expenses/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { budgetId, date, amount, description, category, paymentMethod, receiptImage } = body;

    // Check if the expense exists
    const existingExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check if budget exists if budgetId is provided
    if (budgetId) {
      const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(budgetId);
      if (!budget) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }
    }

    // Build the update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (budgetId !== undefined) {
      updateFields.push('budget_id = ?');
      updateValues.push(budgetId);
    }

    if (date !== undefined) {
      updateFields.push('date = ?');
      updateValues.push(date);
    }

    if (amount !== undefined) {
      updateFields.push('amount = ?');
      updateValues.push(amount);
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }

    if (paymentMethod !== undefined) {
      updateFields.push('payment_method = ?');
      updateValues.push(paymentMethod);
    }

    if (receiptImage !== undefined) {
      updateFields.push('receipt_image = ?');
      updateValues.push(receiptImage);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add the ID to the values array
    updateValues.push(id);

    // Update the expense
    db.prepare(`
      UPDATE expenses 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `).run(...updateValues);

    // Return the updated expense
    const updatedExpense = db.prepare(`
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

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

// DELETE /api/expenses/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if the expense exists
    const existingExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Delete the expense
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
