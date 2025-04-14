"use client";

import React, { useState } from 'react';
import { Event } from '../../lib/models';
import { icons, IconOption } from '../../lib/icons';
import { FaTimes, FaCar, FaWalking, FaBicycle, FaBus, FaSpinner, FaArrowRight, FaMapMarkerAlt, FaCalculator } from 'react-icons/fa';
import { TravelMode, calculateTravelTime } from '../../lib/route-api';

interface EventModalProps {
  event?: Event;
  itineraryId: string;
  onSave: (event: Event) => void;
  onCancel: () => void;
}

export default function EventModal({ event, itineraryId, onSave, onCancel }: EventModalProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  
  // 移動時間計算関連の状態
  const [showTravelCalculator, setShowTravelCalculator] = useState(false);
  const [originLocation, setOriginLocation] = useState('');
  const [travelMode, setTravelMode] = useState<TravelMode>(TravelMode.driving);
  const [travelTimeResult, setTravelTimeResult] = useState<{ duration: number; distance: number; durationText: string; distanceText: string } | null>(null);
  const [calculatingTravel, setCalculatingTravel] = useState(false);
  const [travelError, setTravelError] = useState<string | null>(null);
  
  // 数値型のタイムスタンプを時刻文字列に変換する関数
  const formatTimeForInput = (time?: string | number) => {
    if (!time) return '';
    
    try {
      // 時刻形式の文字列の場合（例: "08:30"）
      if (typeof time === 'string' && time.includes(':')) {
        return time;
      }
      
      // 数値型または文字列型のタイムスタンプ
      const date = new Date(Number(time) || time);
      if (!isNaN(date.getTime())) {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
      
      return '';
    } catch (error) {
      console.error('Error formatting time for input:', error, time);
      return '';
    }
  };
  
  // 日付をYYYY-MM-DD形式にフォーマットする関数
  const formatDateForInput = (date?: string) => {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
      return date;
    } catch (error) {
      console.error('Error formatting date for input:', error, date);
      return '';
    }
  };
  
  const [eventDate, setEventDate] = useState(formatDateForInput(event?.eventDate));
  const [startTime, setStartTime] = useState(formatTimeForInput(event?.startTime));
  const [endTime, setEndTime] = useState(formatTimeForInput(event?.endTime));
  const [icon, setIcon] = useState(event?.icon || '');
  const [link, setLink] = useState(event?.link || '');
  const [activeCategory, setActiveCategory] = useState<string>('transport');

  const categories = [
    { id: 'transport', name: '交通' },
    { id: 'accommodation', name: '宿泊' },
    { id: 'food', name: '食事' },
    { id: 'activity', name: 'アクティビティ' },
    { id: 'other', name: 'その他' },
  ];

  const filteredIcons = icons.filter(icon => icon.category === activeCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 時刻文字列をタイムスタンプに変換する関数
    const timeToTimestamp = (timeStr?: string) => {
      if (!timeStr) return undefined;
      
      try {
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return undefined;
        
        const now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        return date.getTime().toString(); // 文字列型に変換して返す
      } catch (error) {
        console.error('Error converting time to timestamp:', error, timeStr);
        return undefined;
      }
    };
    
    const updatedEvent: Event = {
      id: event?.id || '',
      itineraryId,
      title,
      description: description || undefined,
      location: location || undefined,
      eventDate: eventDate || undefined,
      startTime: timeToTimestamp(startTime),
      endTime: timeToTimestamp(endTime),
      icon: icon || undefined,
      link: link || undefined,
      orderIndex: event?.orderIndex || 0,
    };
    
    onSave(updatedEvent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {event?.id ? 'イベントを編集' : '新しいイベント'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="閉じる"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                住所・場所
              </label>
              <button
                type="button"
                onClick={() => setShowTravelCalculator(!showTravelCalculator)}
                className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
              >
                <FaCalculator className="mr-1" />
                {showTravelCalculator ? '移動時間計算を閉じる' : '移動時間を計算'}
              </button>
            </div>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="東京都新宿区西新宿2-8-1"
            />
          </div>

          {showTravelCalculator && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-md font-medium mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                移動時間計算
              </h3>
              
              <div className="mb-3">
                <label htmlFor="originLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  出発地の住所
                </label>
                <input
                  type="text"
                  id="originLocation"
                  value={originLocation}
                  onChange={(e) => setOriginLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="東京都渋谷区渋谷2-21-1"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  移動手段
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setTravelMode(TravelMode.driving)}
                    className={`flex items-center justify-center px-3 py-2 rounded ${travelMode === TravelMode.driving ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <FaCar className="mr-1" /> 車
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelMode(TravelMode.walking)}
                    className={`flex items-center justify-center px-3 py-2 rounded ${travelMode === TravelMode.walking ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <FaWalking className="mr-1" /> 徒歩
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelMode(TravelMode.cycling)}
                    className={`flex items-center justify-center px-3 py-2 rounded ${travelMode === TravelMode.cycling ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <FaBicycle className="mr-1" /> 自転車
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelMode(TravelMode.transit)}
                    className={`flex items-center justify-center px-3 py-2 rounded ${travelMode === TravelMode.transit ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <FaBus className="mr-1" /> 公共交通
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    if (!originLocation || !location) {
                      setTravelError('出発地と目的地の両方を入力してください');
                      return;
                    }
                    
                    setCalculatingTravel(true);
                    setTravelError(null);
                    
                    try {
                      const result = await calculateTravelTime(originLocation, location, travelMode);
                      setTravelTimeResult(result);
                    } catch (error: any) {
                      setTravelError(error.message || '移動時間の計算に失敗しました');
                      setTravelTimeResult(null);
                    } finally {
                      setCalculatingTravel(false);
                    }
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={calculatingTravel || !originLocation || !location}
                >
                  {calculatingTravel ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      計算中...
                    </>
                  ) : (
                    '移動時間を計算'
                  )}
                </button>
              </div>
              
              {travelError && (
                <div className="mt-3 p-2 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
                  {travelError}
                </div>
              )}
              
              {travelTimeResult && (
                <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex items-start mb-2">
                    <div className="mr-2 text-green-600">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{originLocation}</div>
                      <div className="text-xs text-gray-500">出発地</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-2 text-gray-400">
                    <FaArrowRight />
                  </div>
                  
                  <div className="flex items-start mb-3">
                    <div className="mr-2 text-red-600">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{location}</div>
                      <div className="text-xs text-gray-500">目的地</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-white rounded border border-gray-100">
                      <div className="text-lg font-bold text-blue-600">{travelTimeResult.durationText}</div>
                      <div className="text-xs text-gray-500">所要時間</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-gray-100">
                      <div className="text-lg font-bold text-blue-600">{travelTimeResult.distanceText}</div>
                      <div className="text-xs text-gray-500">距離</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
              日付
            </label>
            <input
              type="date"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                開始時間
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                終了時間
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
              リンク
            </label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アイコン
            </label>
            
            <div className="flex space-x-2 mb-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {filteredIcons.map((iconOption: IconOption) => {
                const IconComponent = iconOption.icon;
                return (
                  <button
                    key={iconOption.id}
                    type="button"
                    className={`p-2 rounded-md flex items-center justify-center ${
                      icon === iconOption.id
                        ? 'bg-blue-100 text-blue-600 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                    onClick={() => setIcon(iconOption.id)}
                    title={iconOption.name}
                  >
                    <IconComponent size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
