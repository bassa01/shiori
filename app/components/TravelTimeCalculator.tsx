"use client";

import React, { useState } from 'react';
import { TravelMode } from '../../lib/route-api';
import { FaCar, FaWalking, FaBicycle, FaBus, FaSpinner, FaArrowRight, FaMapMarkedAlt } from 'react-icons/fa';
import { calculateTravelTime } from '../../lib/client-api';

interface TravelTimeResult {
  duration: number;
  distance: number;
  durationText: string;
  distanceText: string;
}

export default function TravelTimeCalculator() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<TravelMode>(TravelMode.driving);
  const [result, setResult] = useState<TravelTimeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 移動時間を計算
  const calculateTravelTime = async () => {
    if (!origin || !destination) {
      setError('出発地と目的地を入力してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/maps/travel-time?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '移動時間の計算に失敗しました');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error calculating travel time:', err);
      setError(err instanceof Error ? err.message : '移動時間の計算中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 移動手段を選択するボタン
  const ModeButton = ({ value, icon, label }: { value: TravelMode; icon: React.ReactNode; label: string }) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={`flex flex-col items-center p-2 ${
        mode === value ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200'
      } border rounded-md transition-colors`}
      aria-label={label}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">移動時間計算</h2>
      
      <div className="mb-4">
        <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
          出発地
        </label>
        <input
          type="text"
          id="origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="例: 東京駅"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
          目的地
        </label>
        <input
          type="text"
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="例: 新宿駅"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          移動手段
        </label>
        <div className="grid grid-cols-4 gap-2">
          <ModeButton value={TravelMode.driving} icon={<FaCar size={18} />} label="自動車" />
          <ModeButton value={TravelMode.walking} icon={<FaWalking size={18} />} label="徒歩" />
          <ModeButton value={TravelMode.cycling} icon={<FaBicycle size={18} />} label="自転車" />
          <ModeButton value={TravelMode.transit} icon={<FaBus size={18} />} label="公共交通" />
        </div>
      </div>
      
      <button
        onClick={calculateTravelTime}
        disabled={loading || !origin || !destination}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            計算中...
          </>
        ) : (
          <>
            移動時間を計算
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {result && !error && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center mb-2 text-gray-700">
            <div className="font-medium">{origin}</div>
            <FaArrowRight className="mx-2" />
            <div className="font-medium">{destination}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">所要時間</div>
              <div className="text-lg font-semibold">{result.durationText}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">距離</div>
              <div className="text-lg font-semibold">{result.distanceText}</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        ※ 交通状況や道路状況により、実際の移動時間は異なる場合があります。
      </div>
    </div>
  );
}
