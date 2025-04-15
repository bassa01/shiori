import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { nanoid } from 'nanoid';
import type { Event } from '../../../../lib/models'; // Event型のみインポート

import type { ItineraryTransferData, TransferExpense, TransferPackingItem } from '../../../../lib/types/ItineraryTransfer';

// POST /api/itineraries/import - JSONからしおりをインポート
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 型アサーション
    const transferData = data as ItineraryTransferData;
    if (!transferData.itinerary || !transferData.events) {
      return NextResponse.json({ error: 'Invalid import data format' }, { status: 400 });
    }
    
    // トランザクションを使わず順次実行
    // 新しいしおりIDを生成
    const newItineraryId = nanoid();
    
    // しおりを作成 (totalBudgetとcurrencyを追加)
    db.prepare('INSERT INTO itineraries (id, title, created_at, totalBudget, currency) VALUES (?, ?, ?, ?, ?)')
      .run(
        newItineraryId,
        data.itinerary.title,
        Date.now(),
        data.itinerary.totalBudget || 0,
        data.itinerary.currency || 'JPY'
      );

    // イベントを追加
    data.events.forEach((event: Event, index: number) => {
      const newEventId = nanoid();
      db.prepare(`
        INSERT INTO events (
          id, 
          itinerary_id, 
          title, 
          description, 
          event_date, 
          start_time, 
          end_time, 
          icon, 
          link, 
          order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newEventId,
        newItineraryId,
        event.title,
        event.description || null,
        event.eventDate || null,
        event.startTime || null,
        event.endTime || null,
        event.icon || null,
        event.link || null,
        index
      );
    });

    // 費用項目を追加
    if (transferData.expenses && Array.isArray(transferData.expenses)) {
      transferData.expenses.forEach((expense: TransferExpense) => {
        const newExpenseId = nanoid();
        db.prepare(`
          INSERT INTO expenses (
            id, 
            itinerary_id, 
            description, 
            amount, 
            category, 
            expense_date
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          newExpenseId,
          newItineraryId,
          expense.description || '',
          expense.amount || 0,
          expense.category || 'その他',
          expense.expenseDate || Date.now()
        );
      });
    }

    // 持ち物リストを追加
    if (transferData.packingItems && Array.isArray(transferData.packingItems)) {
      transferData.packingItems.forEach((item: TransferPackingItem) => {
        const newItemId = nanoid();
        // checked (import) or isPacked (export) → DBのcheckedへ
        const checked = typeof item.checked === 'boolean' ? item.checked : !!item.isPacked;
        db.prepare(`
          INSERT INTO packing_items (
            id, 
            itinerary_id, 
            name, 
            quantity, 
            checked
          ) VALUES (?, ?, ?, ?, ?)
        `).run(
          newItemId,
          newItineraryId,
          item.name || '',
          item.quantity || 1,
          checked ? 1 : 0
        );
      });
    }

    const result = { id: newItineraryId };
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error importing itinerary:', error);
    return NextResponse.json({ error: 'Failed to import itinerary' }, { status: 500 });
  }
}
