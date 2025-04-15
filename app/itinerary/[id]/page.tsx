"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../../components/Layout';
import EventList from '../../components/EventList';
import EventModal from '../../components/EventModal';
import EditableTitle from '../../components/EditableTitle';
import PackingList from '../../components/PackingList';
import BudgetManager from '../../components/BudgetManager';
import { Event, Itinerary } from '../../../lib/models';
import { FaPlus, FaPencilAlt, FaFileExport, FaFileImport, FaSuitcase, FaCalendarAlt, FaMoneyBillWave, FaMapMarkedAlt } from 'react-icons/fa';
import Link from 'next/link';
import { fetchItinerary, fetchEvents, reorderEvents, updateEvent, deleteEvent, createEvent, exportItinerary, importItinerary, updateItinerary } from '../../../lib/client-api';

export const dynamic = 'force-dynamic';

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itineraryId, setItineraryId] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'packing' | 'budget'>('events');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Next.js 15ではparamsを非同期に処理する必要がある
  useEffect(() => {
    const initParams = async () => {
      const routeParams = await params;
      setItineraryId(routeParams.id);
    };
    initParams();
  }, [params]);

  const loadData = useCallback(async () => {
    if (!itineraryId) return;
    try {
      setLoading(true);
      const itineraryData = await fetchItinerary(itineraryId);
      setItinerary(itineraryData);
      
      const eventsData = await fetchEvents(itineraryId);
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('データの読み込み中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [itineraryId]);

  useEffect(() => {
    // itineraryIdが設定された後にデータを読み込む
    if (!itineraryId) return;

    loadData();
  }, [itineraryId, loadData]);
  
  const handleReorderEvents = async (reorderedEvents: Event[]) => {
    try {
      if (!itinerary) {
        setError('旅程情報が読み込まれていません');
        return;
      }
      
      setLoading(true);
      const updatedEvents = await reorderEvents(itinerary.id, reorderedEvents.map(e => e.id));
      setEvents(updatedEvents);
    } catch (err) {
      console.error('Error reordering events:', err);
      setError('イベントの並び替え中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      setLoading(true);
      await updateEvent(updatedEvent.id, updatedEvent);
      // ローカルのイベントリストを即座に更新
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      // 完全な再取得も行う
      const updatedEvents = await fetchEvents(itineraryId);
      setEvents(updatedEvents);
    } catch (err) {
      console.error('Error updating event:', err);
      setError('イベントの更新中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteEvent = async (id: string) => {
    try {
      setLoading(true);
      await deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('イベントの削除中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateEvent = async (event: Event) => {
    try {
      setLoading(true);
      const newEvent = {
        ...event,
        orderIndex: events.length
      };
      const created = await createEvent(newEvent);
      setEvents([...events, created]);
    } catch (err) {
      console.error('Error creating event:', err);
      setError('イベントの作成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateTitle = async (newTitle: string) => {
    try {
      setLoading(true);
      const updatedItinerary = await updateItinerary(itineraryId, newTitle);
      setItinerary(updatedItinerary);
      setSuccessMessage('しおりのタイトルを更新しました');
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating itinerary title:', err);
      setError('しおりのタイトル更新中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  // エクスポート処理
  const handleExport = async () => {
    try {
      if (!itinerary) {
        setError('旅程情報が読み込まれていません');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const exportData = await exportItinerary(itineraryId);
      
      // JSONファイルとしてダウンロード
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${itinerary.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMessage('しおりをエクスポートしました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error exporting itinerary:', err);
      setError('しおりのエクスポート中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };
  
  // インポート処理
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          if (!event.target || typeof event.target.result !== 'string') {
            throw new Error('ファイルの読み込みに失敗しました');
          }
          
          const importData = JSON.parse(event.target.result);
          await importItinerary(importData);
          
          // 再読み込み
          await loadData();
          
          setSuccessMessage('しおりをインポートしました');
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
          console.error('Error parsing import data:', err);
          setError('ファイルの解析に失敗しました。正しいフォーマットか確認してください。');
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('ファイルの読み込みに失敗しました');
        setLoading(false);
      };
      
      reader.readAsText(file);
    } catch (err) {
      console.error('Error importing itinerary:', err);
      setError('しおりのインポート中にエラーが発生しました');
      setLoading(false);
    } finally {
      // ファイル選択をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <Layout>
      {loading && !itinerary ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">エラー: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      ) : !itinerary ? (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">読み込み中: </strong>
            <span className="block sm:inline">旅程情報を読み込んでいます...</span>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start space-y-4 sm:space-y-0 mb-6">
          <EditableTitle 
            title={itinerary?.title || ''} 
            onSave={handleUpdateTitle} 
          />
          
          <div className="flex space-x-2">
            <Link href={`/itinerary/${itinerary?.id}/map`}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
                <FaMapMarkedAlt className="mr-2" /> 地図表示
              </button>
            </Link>
            <Link href={`/itinerary/${itinerary?.id}/edit`}>
              <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
                <FaPencilAlt className="mr-2" /> 編集
              </button>
            </Link>
            <button 
              onClick={handleExport}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaFileExport className="mr-2" /> エクスポート
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaFileImport className="mr-2" /> インポート
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportFile} 
              className="hidden" 
              accept=".json"
            />
          </div>
        </div>
        
        <div className="mb-6 overflow-x-auto">
          <ul className="flex text-sm font-medium text-center text-gray-500 border-b border-gray-200 whitespace-nowrap">
            <li className="mr-2">
              <button
                className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group ${
                  activeTab === 'events'
                    ? 'text-indigo-600 border-indigo-600 active'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('events')}
              >
                <FaCalendarAlt className={`w-4 h-4 mr-2 ${activeTab === 'events' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                イベント
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group ${
                  activeTab === 'packing'
                    ? 'text-indigo-600 border-indigo-600 active'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('packing')}
              >
                <FaSuitcase className={`w-4 h-4 mr-2 ${activeTab === 'packing' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                持ち物リスト
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group ${
                  activeTab === 'budget'
                    ? 'text-indigo-600 border-indigo-600 active'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('budget')}
              >
                <FaMoneyBillWave className={`w-4 h-4 mr-2 ${activeTab === 'budget' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                予算管理
              </button>
            </li>
          </ul>
        </div>

        {/* イベントタブ */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaCalendarAlt className="text-indigo-600" />
                イベント
              </h2>
              <AddEventButton itineraryId={itinerary?.id || ''} onAddEvent={handleCreateEvent} />
            </div>
            
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>まだイベントがありません。「イベントを追加」ボタンをクリックして、最初のイベントを追加しましょう。</p>
              </div>
            ) : (
              <EventList
                events={events}
                itineraryId={itinerary?.id || ''}
                onReorder={handleReorderEvents}
                onUpdate={handleUpdateEvent}
                onDelete={handleDeleteEvent}
              />
            )}
          </div>
        )}

        {/* 持ち物リストタブ */}
        {activeTab === 'packing' && (
          <PackingList itineraryId={itinerary?.id || ''} />
        )}

        {/* 予算管理タブ */}
        {activeTab === 'budget' && (
          <BudgetManager 
            itineraryId={itinerary?.id || ''} 
            initialTotalBudget={itinerary?.totalBudget || 0}
            initialCurrency={itinerary?.currency || 'JPY'}
          />
        )}
      </div>
      )}
    </Layout>
  );
}

function AddEventButton({ itineraryId, onAddEvent }: { itineraryId: string; onAddEvent: (event: Event) => void }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSaveEvent = (event: Event) => {
    onAddEvent(event);
    setIsModalOpen(false);
  };
  
  return (
    <>
      <button
        onClick={handleOpenModal}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
      >
        <FaPlus className="mr-2" /> イベントを追加
      </button>
      
      {isModalOpen && (
        <EventModal
          itineraryId={itineraryId}
          onSave={handleSaveEvent}
          onCancel={handleCloseModal}
        />
      )}
    </>
  );
}
