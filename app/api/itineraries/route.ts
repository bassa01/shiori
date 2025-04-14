import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { nanoid } from 'nanoid';

// GET /api/itineraries - すべてのしおりを取得
export async function GET() {
  try {
    const rows = db.prepare('SELECT id, title, created_at as createdAt FROM itineraries ORDER BY created_at DESC').all();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    return NextResponse.json({ error: 'Failed to fetch itineraries' }, { status: 500 });
  }
}

// POST /api/itineraries - 新しいしおりを作成
export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const id = nanoid();
    const createdAt = Date.now();
    
    db.prepare('INSERT INTO itineraries (id, title, created_at) VALUES (?, ?, ?)')
      .run(id, title, createdAt);
      
    return NextResponse.json({
      id,
      title,
      createdAt
    });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 });
  }
}
