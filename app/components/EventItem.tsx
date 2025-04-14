"use client";

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Event } from '../../lib/models';
import { getIconById } from '../../lib/icons';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FaGripLines, FaPencilAlt, FaTrash, FaLink, FaClock, FaCheck, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

interface EventItemProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export default function EventItem({ event, onEdit, onDelete }: EventItemProps) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  
  // 時間をHTML5の時間入力フォーマット（HH:MM）に変換する関数
  const convertToTimeInputFormat = (time?: string | number): string => {
    if (!time) return '';
    
    try {
      // 既に「HH:MM」形式の場合はそのまま返す
      if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
        return time;
      }
      
      // 数値型のタイムスタンプまたは文字列型のタイムスタンプを変換
      const date = new Date(Number(time) || time);
      if (!isNaN(date.getTime())) {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
      
      return '';
    } catch (error) {
      console.error('Error converting time to input format:', error, time);
      return '';
    }
  };
  
  // 初期値を設定
  const [startTime, setStartTime] = useState(convertToTimeInputFormat(event.startTime));
  const [endTime, setEndTime] = useState(convertToTimeInputFormat(event.endTime));
  
  // イベントが更新されたときに時間の状態も更新
  React.useEffect(() => {
    setStartTime(convertToTimeInputFormat(event.startTime));
    setEndTime(convertToTimeInputFormat(event.endTime));
  }, [event.startTime, event.endTime]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const iconOption = getIconById(event.icon);
  const Icon = iconOption?.icon;

  const formatTime = (time?: string | number) => {
    if (!time) return '';
    
    // 文字列型と数値型の両方に対応
    try {
      // 時刻形式の文字列の場合（例: "08:30"）
      if (typeof time === 'string' && time.includes(':')) {
        const [hours, minutes] = time.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }
      }
      
      // 数値型のタイムスタンプまたは文字列型のタイムスタンプ
      const date = new Date(Number(time) || time);
      if (!isNaN(date.getTime())) {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
      
      return '';
    } catch (error) {
      console.error('Error formatting time:', error, time);
      return '';
    }
  };

  // 時間編集の保存処理
  const handleSaveTime = () => {
    const updatedEvent = {
      ...event,
      startTime,
      endTime
    };
    onEdit(updatedEvent);
    setIsEditingTime(false);
  };
  
  // 時間編集のキャンセル処理
  const handleCancelTimeEdit = () => {
    setStartTime(event.startTime || '');
    setEndTime(event.endTime || '');
    setIsEditingTime(false);
  };
  
  // 時間表示または編集フォーム
  const timeDisplay = isEditingTime ? (
    <div className="flex items-center space-x-2 mt-1">
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
      />
      <span className="text-gray-500">-</span>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
      />
      <button 
        onClick={handleSaveTime}
        className="text-green-500 hover:text-green-700"
        title="保存"
      >
        <FaCheck size={14} />
      </button>
      <button 
        onClick={handleCancelTimeEdit}
        className="text-red-500 hover:text-red-700"
        title="キャンセル"
      >
        <FaTimes size={14} />
      </button>
    </div>
  ) : (
    <div className="flex items-center text-sm text-gray-600 mt-1 cursor-pointer hover:text-blue-500" onClick={() => setIsEditingTime(true)}>
      <FaClock className="mr-1" size={14} />
      {event.startTime || event.endTime ? (
        <span>
          {formatTime(event.startTime)}
          {event.startTime && event.endTime && ' - '}
          {formatTime(event.endTime)}
        </span>
      ) : (
        <span>時間を設定</span>
      )}
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-200 hover:border-blue-300"
    >
      <div className="flex items-center">
        <div
          {...attributes}
          {...listeners}
          className="mr-2 cursor-grab text-gray-400 hover:text-gray-600"
        >
          <FaGripLines />
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center mb-1">
            {Icon && (
              <span className="mr-2 text-blue-500">
                <Icon size={18} />
              </span>
            )}
            <h3 className="font-semibold">{event.title}</h3>
          </div>
          
          {timeDisplay}
          
          {event.description && (
            <p className="text-gray-700 mt-2">{event.description}</p>
          )}
          
          {event.location && (
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <FaMapMarkerAlt className="mr-1 text-red-500" size={14} />
              <span>{event.location}</span>
            </div>
          )}
          
          {event.link && (
            <div className="mt-2">
              <Link 
                href={event.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                <FaLink className="mr-1" size={14} />
                <span className="text-sm">リンク</span>
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(event)}
            className="p-1 text-gray-500 hover:text-blue-500"
            aria-label="編集"
          >
            <FaPencilAlt size={16} />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-1 text-gray-500 hover:text-red-500"
            aria-label="削除"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
