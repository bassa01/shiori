"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import Link from 'next/link';
import { fetchItinerary, updateItinerary } from '../../../../lib/client-api';
import { FaSave, FaTimes } from 'react-icons/fa';

export default function EditItineraryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [itineraryId, setItineraryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Next.js 15ではparamsを非同期に処理する必要がある
  useEffect(() => {
    const initParams = async () => {
      const routeParams = await params;
      setItineraryId(routeParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    // itineraryIdが設定された後にデータを読み込む
    if (!itineraryId) return;

    const loadItinerary = async () => {
      try {
        setLoading(true);
        const itineraryData = await fetchItinerary(itineraryId);
        setTitle(itineraryData.title);
        setError(null);
      } catch (err) {
        console.error('Error loading itinerary:', err);
        setError('しおりの読み込み中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    loadItinerary();
  }, [itineraryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    
    try {
      setSaving(true);
      await updateItinerary(itineraryId, title);
      // 編集が完了したら詳細ページに戻る
      router.push(`/itinerary/${itineraryId}`);
    } catch (err) {
      console.error('Error updating itinerary:', err);
      setError('しおりの更新中にエラーが発生しました');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/itinerary/${itineraryId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/itinerary/${itineraryId}`} className="text-blue-500 hover:text-blue-700 mb-4 inline-block">
            ← しおりに戻る
          </Link>
          <h1 className="text-2xl font-bold">しおりを編集</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="しおりのタイトルを入力"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                disabled={saving}
              >
                <FaTimes className="mr-2" /> キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> 保存
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
