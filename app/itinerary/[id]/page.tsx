"use client";

import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { useRouter } from 'next/navigation';
import EventList from '../../components/EventList';
import EventModal from '../../components/EventModal';
import EditableTitle from '../../components/EditableTitle';
import { Event } from '../../../lib/models';
import { FaPlus, FaPencilAlt, FaTrash, FaFileExport, FaFileImport } from 'react-icons/fa';
import Link from 'next/link';
import { fetchItinerary, fetchEvents, reorderEvents, updateEvent, deleteEvent, createEvent, exportItinerary, importItinerary, updateItinerary } from '../../../lib/client-api';

export const dynamic = 'force-dynamic';

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [itinerary, setItinerary] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itineraryId, setItineraryId] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const loadData = async () => {
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
    };
    
    loadData();
  }, [itineraryId]);
  
  const handleReorderEvents = async (reorderedEvents: Event[]) => {
    try {
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
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
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
          const result = await importItinerary(importData);
          
          // インポート成功後、新しいしおりページに移動
          router.push(`/itinerary/${result.id}`);
        } catch (err) {
          console.error('Error processing import file:', err);
          setError('しおりのインポート中にエラーが発生しました');
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
  
  if (loading && !itinerary) {
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

  if (error || !itinerary) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <p className="font-bold">エラーが発生しました</p>
            <p className="text-sm">{error || 'しおりが見つかりませんでした'}</p>
          </div>
          <Link href="/" className="mt-6 inline-block text-blue-500 hover:text-blue-700">
            ← ホームに戻る
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/" className="text-blue-500 hover:text-blue-700 mb-2 inline-block">
              ← ホームに戻る
            </Link>
            <EditableTitle 
              title={itinerary.title} 
              onSave={handleUpdateTitle}
              titleClassName="text-2xl font-bold"
            />
          </div>
          
          <div className="flex space-x-2">
            <form action={`/itinerary/${itinerary.id}/edit`} method="get">
              <button
                type="submit"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center"
              >
                <FaPencilAlt className="mr-2" /> 編集
              </button>
            </form>
            
            <button
              onClick={handleExport}
              className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-md flex items-center"
            >
              <FaFileExport className="mr-2" /> エクスポート
            </button>
            
            <label
              htmlFor="import-file"
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md flex items-center cursor-pointer"
            >
              <FaFileImport className="mr-2" /> インポート
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        {loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>データを更新中...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p>{successMessage}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">イベント</h2>
            <AddEventButton itineraryId={itinerary.id} onAddEvent={handleCreateEvent} />
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>まだイベントがありません。「イベントを追加」ボタンをクリックして、最初のイベントを追加しましょう。</p>
            </div>
          ) : (
            <EventList
              events={events}
              itineraryId={itinerary.id}
              onReorder={handleReorderEvents}
              onUpdate={handleUpdateEvent}
              onDelete={handleDeleteEvent}
            />
          )}
        </div>
      </div>
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
