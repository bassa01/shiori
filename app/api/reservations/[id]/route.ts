import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

// GET /api/reservations/[id] - 特定の予約を取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const id = routeParams.id;
    
    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    
    if (!reservation) {
      return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 });
    }
    
    // スネークケースからキャメルケースに変換
    const formattedReservation = {
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
    };
    
    return NextResponse.json(formattedReservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json({ error: '予約の取得に失敗しました' }, { status: 500 });
  }
}

// PUT /api/reservations/[id] - 予約を更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const id = routeParams.id;
    const body = await request.json();
    
    const {
      type,
      status,
      confirmationNumber,
      provider,
      bookingDate,
      price,
      currency,
      notes,
      contactInfo,
      attachmentUrls = []
    } = body;
    
    // 予約の存在確認
    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    if (!reservation) {
      return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 });
    }
    
    // 添付ファイルURLの配列をJSON文字列に変換
    const attachmentUrlsJson = attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : null;
    const now = Date.now();
    
    db.prepare(`
      UPDATE reservations SET
        type = COALESCE(?, type),
        status = COALESCE(?, status),
        confirmation_number = ?,
        provider = ?,
        booking_date = ?,
        price = ?,
        currency = ?,
        notes = ?,
        contact_info = ?,
        attachment_urls = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      type, status, confirmationNumber, provider, bookingDate,
      price, currency, notes, contactInfo, attachmentUrlsJson,
      now, id
    );
    
    // 更新された予約を取得
    const updatedReservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    
    // スネークケースからキャメルケースに変換
    const formattedReservation = {
      id: updatedReservation.id,
      eventId: updatedReservation.event_id,
      itineraryId: updatedReservation.itinerary_id,
      type: updatedReservation.type,
      status: updatedReservation.status,
      confirmationNumber: updatedReservation.confirmation_number,
      provider: updatedReservation.provider,
      bookingDate: updatedReservation.booking_date,
      price: updatedReservation.price,
      currency: updatedReservation.currency,
      notes: updatedReservation.notes,
      contactInfo: updatedReservation.contact_info,
      attachmentUrls: updatedReservation.attachment_urls ? JSON.parse(updatedReservation.attachment_urls) : [],
      createdAt: updatedReservation.created_at,
      updatedAt: updatedReservation.updated_at
    };
    
    return NextResponse.json(formattedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: '予約の更新に失敗しました' }, { status: 500 });
  }
}

// DELETE /api/reservations/[id] - 予約を削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Next.js 15ではparamsをawaitする必要がある
    const routeParams = await params;
    const id = routeParams.id;
    
    // 予約の存在確認
    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    if (!reservation) {
      return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 });
    }
    
    // 予約を削除
    db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: '予約の削除に失敗しました' }, { status: 500 });
  }
}
