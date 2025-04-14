"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaTrash, FaExclamationTriangle, FaEdit, FaEye } from 'react-icons/fa';
import { FiCalendar, FiClock, FiMapPin, FiPlus, FiSearch } from 'react-icons/fi';
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
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            </div>
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            読み込み中...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-md" role="alert">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-100 text-red-600 p-2 rounded-full">
            <FaExclamationTriangle size={24} />
          </div>
          <h3 className="text-lg font-semibold text-red-800">エラーが発生しました</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchItineraries();
          }}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors duration-300 inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          再試行
        </button>
      </div>
    );
  }

  if (itineraries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-75 blur"></div>
            <div className="relative bg-white p-4 rounded-full">
              <FiCalendar size={64} className="text-indigo-600" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-800">まだしおりがありません</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          旅行の計画を立てて、思い出に残る体験を作りましょう。「新規作成」ボタンをクリックして始めましょう。
        </p>
        <Link 
          href="/create" 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <FiPlus />
          <span>最初のしおりを作成する</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiCalendar className="text-indigo-600" />
          <span>あなたの旅のしおり</span>
        </h1>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="しおりを検索..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm === '') {
                  fetchItineraries();
                } else {
                  setItineraries(prev => 
                    prev.filter(item => item.title.toLowerCase().includes(searchTerm))
                  );
                }
              }}
            />
          </div>
          
          <Link 
            href="/create" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <FiPlus />
            <span className="hidden md:inline">新規作成</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary) => (
          <div key={itinerary.id} className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1">
            {/* Card header with gradient */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors duration-300 line-clamp-1">
                      {itinerary.title}
                    </h2>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <FiClock size={14} />
                      {itinerary.createdAt ? dayjs(itinerary.createdAt).format('YYYY年MM月DD日') : '日付なし'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <Link 
                  href={`/itinerary/${itinerary.id}/edit`}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaEdit size={14} />
                  <span>編集</span>
                </Link>
                
                <Link 
                  href={`/itinerary/${itinerary.id}`}
                  className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors duration-300"
                >
                  <FaEye size={14} />
                  <span>表示</span>
                </Link>
                
                <button
                  onClick={(e) => openDeleteModal(e, itinerary)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors duration-300"
                  aria-label="削除"
                >
                  <FaTrash size={14} />
                  <span>削除</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 削除確認モーダル - モダンなデザイン */}
      {deleteModalOpen && itineraryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-xl p-0 max-w-md w-full mx-auto shadow-2xl transform transition-all duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <FaExclamationTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold">しおりの削除</h3>
              </div>
            </div>
            
            {/* モーダル本文 */}
            <div className="p-6">
              <p className="text-gray-700 mb-2 font-medium">以下のしおりを削除しようとしています：</p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
                <p className="font-semibold text-gray-800 break-words">「{itineraryToDelete.title}」</p>
                <p className="text-sm text-gray-500 mt-1">
                  作成日: {itineraryToDelete.createdAt ? dayjs(itineraryToDelete.createdAt).format('YYYY年MM月DD日') : '日付なし'}
                </p>
              </div>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
                <p className="text-amber-800">この操作は元に戻せません。しおり内のすべてのイベントも削除されます。</p>
              </div>
            </div>
            
            {/* モーダルフッター */}
            <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300 font-medium"
                disabled={isDeleting}
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteItinerary}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    削除中...
                  </>
                ) : (
                  <>
                    <FaTrash size={16} />
                    削除する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
