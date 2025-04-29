import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';

// GET /api/packing-items/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Get the packing item
    const item = db.prepare(`
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

    if (!item) {
      return NextResponse.json({ error: 'Packing item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching packing item:', error);
    return NextResponse.json({ error: 'Failed to fetch packing item' }, { status: 500 });
  }
}

// PUT /api/packing-items/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, category, isPacked, quantity, notes, isEssential } = body;

    // Check if the item exists
    const existingItem = db.prepare('SELECT * FROM packing_items WHERE id = ?').get(id);
    if (!existingItem) {
      return NextResponse.json({ error: 'Packing item not found' }, { status: 404 });
    }

    // Build the update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }

    if (isPacked !== undefined) {
      updateFields.push('is_packed = ?');
      updateValues.push(isPacked ? 1 : 0);
    }

    if (quantity !== undefined) {
      updateFields.push('quantity = ?');
      updateValues.push(quantity);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }

    if (isEssential !== undefined) {
      updateFields.push('is_essential = ?');
      updateValues.push(isEssential ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add the ID to the values array
    updateValues.push(id);

    // Update the packing item
    db.prepare(`
      UPDATE packing_items 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `).run(...updateValues);

    // Return the updated item
    const updatedItem = db.prepare(`
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

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating packing item:', error);
    return NextResponse.json({ error: 'Failed to update packing item' }, { status: 500 });
  }
}

// DELETE /api/packing-items/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if the item exists
    const existingItem = db.prepare('SELECT * FROM packing_items WHERE id = ?').get(id);
    if (!existingItem) {
      return NextResponse.json({ error: 'Packing item not found' }, { status: 404 });
    }

    // Delete the packing item
    db.prepare('DELETE FROM packing_items WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting packing item:', error);
    return NextResponse.json({ error: 'Failed to delete packing item' }, { status: 500 });
  }
}
