import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import db from '../../../lib/db';
import { DbReservation } from '../../../lib/models';

// GET /api/reservations - 予約一覧を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itineraryId = searchParams.get('itineraryId');
    const eventId = searchParams.get('eventId');
    
    if (!itineraryId && !eventId) {
      return NextResponse.json({ error: 'itineraryId または eventId が必要です' }, { status: 400 });
    }
    
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params: string[] = [];
    
    if (itineraryId) {
      query += ' AND itinerary_id = ?';
      params.push(itineraryId);
    }
    
    if (eventId) {
      query += ' AND event_id = ?';
      params.push(eventId);
    }
    
    const reservations = db.prepare(query).all(...params);
    
    // スネークケースからキャメルケースに変換
    const formattedReservations = reservations.map((reservation: DbReservation) => ({
      id: reservation.id,
      eventId: reservation.event_id,
      itineraryId: reservation.itinerary_id,
      type: reservation.type,
      status: reservation.status,
      confirmationNumber: reservation.confirmation_number,
      provider: reservation.provider,
      bookingDate: reservation.booking_date,
      price: reservation.price,
      currency: reservation.currency,
      notes: reservation.notes,
      contactInfo: reservation.contact_info,
      attachmentUrls: reservation.attachment_urls ? JSON.parse(reservation.attachment_urls) : [],
      createdAt: reservation.created_at,
      updatedAt: reservation.updated_at
    }));
    
    return NextResponse.json(formattedReservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: '予約情報の取得に失敗しました' }, { status: 500 });
  }
}

// POST /api/reservations - 新しい予約を作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      eventId,
      itineraryId,
      type,
      status = 'notBooked',
      confirmationNumber,
      provider,
      bookingDate,
      price,
      currency,
      notes,
      contactInfo,
      attachmentUrls = []
    } = body;
    
    // 必須フィールドの検証
    if (!eventId || !itineraryId || !type) {
      return NextResponse.json({ error: 'eventId, itineraryId, type は必須です' }, { status: 400 });
    }
    
    // イベントの存在確認
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return NextResponse.json({ error: '指定されたイベントが見つかりません' }, { status: 404 });
    }
    
    // 旅程の存在確認
    const itinerary = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(itineraryId);
    if (!itinerary) {
      return NextResponse.json({ error: '指定された旅程が見つかりません' }, { status: 404 });
    }
    
    // 既存の予約を確認（1つのイベントに対して1つの予約のみ許可）
    const existingReservation = db.prepare('SELECT * FROM reservations WHERE event_id = ?').get(eventId);
    if (existingReservation) {
      return NextResponse.json({ error: 'このイベントには既に予約が登録されています' }, { status: 409 });
    }
    
    const id = nanoid();
    const now = Date.now();
    
    // 添付ファイルURLの配列をJSON文字列に変換
    const attachmentUrlsJson = attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : null;
    
    db.prepare(`
      INSERT INTO reservations (
        id, event_id, itinerary_id, type, status, confirmation_number,
        provider, booking_date, price, currency, notes, contact_info,
        attachment_urls, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, eventId, itineraryId, type, status, confirmationNumber,
      provider, bookingDate, price, currency, notes, contactInfo,
      attachmentUrlsJson, now, now
    );
    
    const newReservation = {
      id,
      eventId,
      itineraryId,
      type,
      status,
      confirmationNumber,
      provider,
      bookingDate,
      price,
      currency,
      notes,
      contactInfo,
      attachmentUrls: attachmentUrls || [],
      createdAt: now,
      updatedAt: now
    };
    
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: '予約の作成に失敗しました' }, { status: 500 });
  }
}
