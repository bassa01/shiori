import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/db';

// PUT /api/itineraries/[id]/budget
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In Next.js 15, params needs to be awaited
    const routeParams = await params;
    const id = routeParams.id;
    const body = await request.json();
    const { totalBudget, currency } = body;

    if (totalBudget === undefined) {
      return NextResponse.json({ error: 'totalBudget is required' }, { status: 400 });
    }

    console.log('Updating itinerary budget:', { id, totalBudget, currency });

    // Check if the itinerary exists
    const existingItinerary = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(id);
    if (!existingItinerary) {
      console.log('Itinerary not found:', id);
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }

    console.log('Existing itinerary:', existingItinerary);
    
    // Update the itinerary's budget
    try {
      console.log('Executing SQL update with values:', { totalBudget, currency, id });
      
      // Log the table schema to verify column names
      const tableInfo = db.prepare("PRAGMA table_info(itineraries)").all();
      console.log('Table schema for itineraries:', tableInfo);
      
      if (currency) {
        const result = db.prepare('UPDATE itineraries SET totalBudget = ?, currency = ? WHERE id = ?')
          .run(totalBudget, currency, id);
        console.log('Update result with currency:', result);
      } else {
        const result = db.prepare('UPDATE itineraries SET totalBudget = ? WHERE id = ?')
          .run(totalBudget, id);
        console.log('Update result without currency:', result);
      }
      
      // Verify the update worked by fetching the updated record
      const updatedItinerary = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(id);
      console.log('Updated itinerary record:', updatedItinerary);
      
      if (!updatedItinerary) {
        throw new Error('Failed to retrieve updated itinerary');
      }
    } catch (error) {
      console.error('Error updating budget in database:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `Database error updating budget: ${errorMessage}` }, { status: 500 });
    }

    // Return the updated itinerary
    const updatedItinerary = db.prepare(`
      SELECT 
        id, 
        title, 
        created_at as createdAt,
        totalBudget,
        currency
      FROM itineraries 
      WHERE id = ?
    `).get(id);

    return NextResponse.json(updatedItinerary);
  } catch (error) {
    console.error('Error updating itinerary budget:', error);
    return NextResponse.json({ error: 'Failed to update itinerary budget' }, { status: 500 });
  }
}
