import React from 'react';
import db from '../../lib/db';
import Layout from '../components/Layout';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';

// サーバーアクションでしおりを作成する
async function createItinerary(formData: FormData) {
  'use server';
  
  const title = formData.get('title') as string;
  
  if (!title) {
    // エラー処理はここで行うべきだが、簡略化のためにリダイレクトする
    redirect('/create');
  }
  
  const id = nanoid();
  const createdAt = Date.now();
  
  db.prepare('INSERT INTO itineraries (id, title, created_at) VALUES (?, ?, ?)')
    .run(id, title, createdAt);
  
  redirect(`/itinerary/${id}`);
}

export default function CreateItinerary() {

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">新しいしおりを作成</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form action={createItinerary} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="例: 沖縄旅行 2023年5月"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              作成
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
