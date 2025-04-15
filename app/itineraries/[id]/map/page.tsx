'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchItinerary, fetchEvents } from '../../../../lib/client-api';
import { Itinerary, Event } from '../../../../lib/models';
import MapView from '../../../components/MapView';
import { Button } from '../../../components/ui/button';
import { FaArrowLeft, FaMapMarkedAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function MapPage() {
  const params = useParams();
  const itineraryId = params.id as string;
  
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 旅程情報を取得
        const itineraryData = await fetchItinerary(itineraryId);
        setItinerary(itineraryData);
        
        // イベント情報を取得
        const eventsData = await fetchEvents(itineraryId);
        
        // 日付でソート
        const sortedEvents = eventsData.sort((a: Event, b: Event) => {
          // 日付比較
          const aDate = a.eventDate || '';
          const bDate = b.eventDate || '';
          const dateComparison = aDate.localeCompare(bDate);
          if (dateComparison !== 0) return dateComparison;
          
          // 同じ日付の場合は時間で比較
          const aTime = a.startTime || '00:00';
          const bTime = b.startTime || '00:00';
          return aTime.localeCompare(bTime);
        });
        
        setEvents(sortedEvents);
      } catch (err) {
        console.error('データの取得に失敗しました:', err);
        setError('データの取得に失敗しました。もう一度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [itineraryId]);
  
  // 位置情報を持つイベントをカウント
  const eventsWithLocationCount = events.filter(event => event.location && event.location.trim() !== '').length;
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Link href={`/itineraries/${itineraryId}`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <FaArrowLeft size={14} />
              <span>旅程に戻る</span>
            </Button>
          </Link>
          
          <h1 className="text-2xl font-bold">
            {isLoading ? '地図を読み込み中...' : itinerary ? `${itinerary.title} - 地図` : '地図'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FaMapMarkedAlt className="text-blue-500" />
          <span>{eventsWithLocationCount} 箇所の場所が登録されています</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>データを読み込み中...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center text-red-500 p-4">
            <p className="text-lg font-bold mb-2">エラー</p>
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </Button>
          </div>
        </div>
      ) : (
        <>
          <MapView events={events} itineraryId={itineraryId} />
          
          <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm">
            <h3 className="font-bold text-blue-700 mb-2">地図の使い方</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-800">
              <li>マーカーをクリックすると、詳細情報が表示されます</li>
              <li>右下のボタンで、ルートの表示/非表示を切り替えられます</li>
              <li>現在地ボタンで、あなたの現在位置を表示できます</li>
              <li>すべてのマーカーボタンで、登録されたすべての場所を表示します</li>
            </ul>
            <p className="mt-3 text-blue-700">
              <strong>注意:</strong> イベントに場所情報が登録されていない場合は地図上に表示されません。
              イベントの編集画面で場所を追加してください。
            </p>
          </div>
        </>
      )}
    </div>
  );
}
