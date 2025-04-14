import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

// GET /api/itineraries/[id] - 特定のしおりを取得
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const { id } = routeParams;
    const row = db.prepare('SELECT id, title, created_at as createdAt FROM itineraries WHERE id = ?').get(id);
    
    if (!row) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }
    
    return NextResponse.json(row);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json({ error: 'Failed to fetch itinerary' }, { status: 500 });
  }
}

// PUT /api/itineraries/[id] - しおりを更新
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const { id } = routeParams;
    const { title } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const result = db.prepare('UPDATE itineraries SET title = ? WHERE id = ?').run(title, id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }
    
    const updated = db.prepare('SELECT id, title, created_at as createdAt FROM itineraries WHERE id = ?').get(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating itinerary:', error);
    return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 });
  }
}

// DELETE /api/itineraries/[id] - しおりを削除
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const { id } = routeParams;
    const result = db.prepare('DELETE FROM itineraries WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    return NextResponse.json({ error: 'Failed to delete itinerary' }, { status: 500 });
  }
}
