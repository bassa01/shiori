'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Event } from '../../lib/models';
import { FaMapMarkedAlt } from 'react-icons/fa';

// クライアントサイドでのみロードされるMapコンポーネント
const MapWithNoSSR = dynamic(
  () => import('./MapClient'),
  { ssr: false }
);

interface MapViewProps {
  events: Event[];
}



export default function MapView({ events }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのレンダリングを確認
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 有効な座標を持つイベントの数を計算
  const validLocationCount = useMemo(() => {
    return events.filter(
      (event) => 
        typeof event.latitude === 'number' && !isNaN(event.latitude as number) &&
        typeof event.longitude === 'number' && !isNaN(event.longitude as number)
    ).length;
  }, [events]);

  // クライアントサイドでない場合はローディング表示
  if (!isClient) {
    return (
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center p-4">
            <div className="animate-pulse">
              <FaMapMarkedAlt size={48} className="text-gray-300 mx-auto mb-4" />
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // イベントがない場合
  if (events.length === 0) {
    return (
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center p-4">
            <FaMapMarkedAlt size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">表示する場所がありません</h3>
            <p className="text-gray-600">
              イベントに場所を追加すると、ここに地図が表示されます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 有効な座標を持つイベントがない場合
  if (validLocationCount === 0) {
    return (
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center p-4">
            <FaMapMarkedAlt size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">場所の座標が見つかりません</h3>
            <p className="text-gray-600">
              イベントに座標情報（緯度・経度）が登録されていないため、地図に表示できません。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 有効な座標を持つイベントがある場合、MapClientコンポーネントをロード
  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-md">
      <MapWithNoSSR events={events} />
    </div>
  );
}
