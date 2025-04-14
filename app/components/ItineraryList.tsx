"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import dayjs from 'dayjs';
import { deleteItinerary } from '../../lib/client-api';

interface Itinerary {
  id: string;
  title: string;
  createdAt: number;
}

export default function ItineraryList() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState<Itinerary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // しおりの取得
  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/itineraries');
      
      if (!response.ok) {
        throw new Error('しおりの取得に失敗しました');
      }
      
      const data = await response.json();
      setItineraries(data);
    } catch (err) {
      console.error('Error fetching itineraries:', err);
      setError('しおりの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  // しおりの削除
  const handleDeleteItinerary = async () => {
    if (!itineraryToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteItinerary(itineraryToDelete.id);
      
      // 削除後、リストを更新
      setItineraries(prevItineraries => 
        prevItineraries.filter(item => item.id !== itineraryToDelete.id)
      );
      
      // モーダルを閉じる
      setDeleteModalOpen(false);
      setItineraryToDelete(null);
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      setError('しおりの削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // 削除確認モーダルを開く
  const openDeleteModal = (e: React.MouseEvent, itinerary: Itinerary) => {
    e.preventDefault();
    e.stopPropagation();
    setItineraryToDelete(itinerary);
    setDeleteModalOpen(true);
  };
  
  // 初回読み込み時にしおりを取得
  useEffect(() => {
    fetchItineraries();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (itineraries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4 text-blue-500">
          <FaCalendarAlt size={48} />
        </div>
        <h2 className="text-xl font-semibold mb-2">まだしおりがありません</h2>
        <p className="text-gray-600 mb-6">
          「新規作成」ボタンをクリックして、最初の旅のしおりを作成しましょう。
        </p>
        <Link 
          href="/create" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md inline-block"
        >
          しおりを作成する
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {itineraries.map((itinerary) => (
          <div key={itinerary.id} className="relative">
            <Link 
              href={`/itinerary/${itinerary.id}`}
              className="block"
            >
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300">
                <h2 className="text-xl font-semibold mb-2 pr-8">{itinerary.title}</h2>
                <p className="text-gray-600 text-sm">
                  作成日: {itinerary.createdAt ? dayjs(itinerary.createdAt).format('YYYY年MM月DD日') : '日付なし'}
                </p>
              </div>
            </Link>
            <button
              onClick={(e) => openDeleteModal(e, itinerary)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="削除"
            >
              <FaTrash size={16} />
            </button>
          </div>
        ))}
      </div>
      
      {/* 削除確認モーダル */}
      {deleteModalOpen && itineraryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center text-red-500 mb-4">
              <FaExclamationTriangle className="mr-2" size={24} />
              <h3 className="text-xl font-semibold">しおりの削除</h3>
            </div>
            
            <p className="mb-6">「{itineraryToDelete.title}」を削除してもよろしいですか？この操作は元に戻せません。</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={isDeleting}
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteItinerary}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
