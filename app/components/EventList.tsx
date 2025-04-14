"use client";

import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Event } from '../../lib/models';
import EventItem from './EventItem';
import EventModal from './EventModal';
import { calculateTravelTime, TravelMode } from '../../lib/route-api';
import { FaCheck, FaExclamationTriangle, FaTimes, FaRoute, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import { FiCalendar, FiClock, FiMapPin, FiPlus, FiList, FiMap, FiArrowDown, FiArrowUp } from 'react-icons/fi';

interface EventListProps {
  events: Event[];
  itineraryId: string;
  onReorder: (events: Event[]) => void;
  onUpdate: (event: Event) => void;
  onDelete: (id: string) => void;
}

export default function EventList({ events, itineraryId, onReorder, onUpdate, onDelete }: EventListProps) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [localEvents, setLocalEvents] = useState<Event[]>(events);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<Event | null>(null);
  const [showTravelCheck, setShowTravelCheck] = useState(false);
  const [travelConnections, setTravelConnections] = useState<{[key: string]: {status: 'ok' | 'warning' | 'error', travelTime: number}}>({});
  const [isCheckingTravel, setIsCheckingTravel] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reactのeffectでeventsの変更をローカルステートに反映
  React.useEffect(() => {
    if (!isDragging) {
      setLocalEvents(events);
    }
  }, [events, isDragging]);
  
  // 保留された更新を処理するメカニズムは使わないことにしました
  // 代わりにドラッグ終了時に直接更新を実行します
  
  // ドラッグ開始時の処理
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
  };
  
  // ドラッグ中の処理
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const draggedEvent = localEvents.find(item => item.id === active.id);
      const targetEvent = localEvents.find(item => item.id === over.id);
      
      if (!draggedEvent || !targetEvent) return;
      
      // ドラッグ元とドロップ先の日付グループを取得
      const draggedDateGroup = getEventDateGroup(active.id);
      const targetDateGroup = getEventDateGroup(over.id);
      
      console.log('DragOver: draggedDateGroup =', draggedDateGroup, 'targetDateGroup =', targetDateGroup);
      
      // 日付が設定されていないイベントを日付が設定されたイベントの上にドラッグした場合
      // または、日付が設定されたイベントを別の日付グループにドラッグした場合
      if ((draggedDateGroup !== targetDateGroup) && targetDateGroup !== 'no-date') {
        console.log('DragOver: Setting date from', draggedEvent.eventDate, 'to', targetDateGroup);
        
        const oldIndex = localEvents.findIndex(item => item.id === active.id);
        const newIndex = localEvents.findIndex(item => item.id === over.id);
        
        const newLocalEvents = [...localEvents];
        // ドラッグ中のイベントに日付を設定
        newLocalEvents[oldIndex] = { 
          ...draggedEvent, 
          eventDate: targetDateGroup === 'no-date' ? undefined : targetDateGroup 
        };
        
        // ローカルステートを更新
        setLocalEvents(arrayMove(newLocalEvents, oldIndex, newIndex));
      } else {
        // 通常の並び替え
        const oldIndex = localEvents.findIndex(item => item.id === active.id);
        const newIndex = localEvents.findIndex(item => item.id === over.id);
        
        setLocalEvents(arrayMove(localEvents, oldIndex, newIndex));
      }
    }
  };
  
  // ドラッグアンドドロップの終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('DragEnd: active =', active.id, 'over =', over?.id);
    
    // ローカルステートからドラッグしたイベントを取得
    const draggedEvent = localEvents.find(item => item.id === active.id);
    if (!draggedEvent) {
      console.log('DragEnd: draggedEvent not found');
      return;
    }
    
    // 元のイベントを取得
    const originalEvent = events.find(item => item.id === active.id);
    if (!originalEvent) {
      console.log('DragEnd: originalEvent not found');
      return;
    }
    
    console.log('DragEnd: Original event date =', originalEvent.eventDate);
    console.log('DragEnd: Dragged event date =', draggedEvent.eventDate);
    
    // 日付が変更されているか確認
    const dateChanged = originalEvent.eventDate !== draggedEvent.eventDate;
    if (dateChanged) {
      console.log('DragEnd: Date changed from', originalEvent.eventDate, 'to', draggedEvent.eventDate);
      
      // 日付が変更されたイベントを作成
      const updatedEvent = {
        ...originalEvent,
        eventDate: draggedEvent.eventDate
      };
      
      console.log('DragEnd: Updating event with new date:', updatedEvent);
      // 日付が変更されている場合、直接更新を実行
      onUpdate(updatedEvent);
      
      // ローカルステートのイベントも更新して、UIに反映させる
      const updatedLocalEvents = localEvents.map(e => 
        e.id === updatedEvent.id ? updatedEvent : e
      );
      setLocalEvents(updatedLocalEvents);
    }
    
    // ドラッグが別のアイテム上で終了した場合のみ並び替えを実行
    if (over && active.id !== over.id) {
      // 元のイベント配列のインデックスを取得
      const oldIndex = events.findIndex(item => item.id === active.id);
      const newIndex = events.findIndex(item => item.id === over.id);
      
      // イベントの並び替え
      const newEvents = arrayMove([...events], oldIndex, newIndex).map(
        (event, index) => ({
          ...event,
          orderIndex: index
        })
      );
      
      // 並び替えを親コンポーネントに通知
      onReorder(newEvents);
    }
    
    // ドラッグ終了フラグをリセット
    setIsDragging(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
  };

  const handleSaveEdit = (updatedEvent: Event) => {
    onUpdate(updatedEvent);
    setEditingEvent(null);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
  };

  // 日付ごとにイベントをグループ化する
  const groupEventsByDate = () => {
    const groups: { [key: string]: Event[] } = {};
    
    // 日付が指定されていないイベント用のグループ
    const noDateGroup = 'no-date';
    groups[noDateGroup] = [];
    
    // 日付でグループ化
    // ドラッグ中はローカルステートを使用、それ以外は親からのプロップを使用
    const currentEvents = isDragging ? localEvents : events;
    currentEvents.forEach(event => {
      if (event.eventDate) {
        if (!groups[event.eventDate]) {
          groups[event.eventDate] = [];
        }
        groups[event.eventDate].push(event);
      } else {
        groups[noDateGroup].push(event);
      }
    });
    
    // 日付でソート
    const sortedDates = Object.keys(groups)
      .filter(date => date !== noDateGroup)
      .sort();
    
    // 日付なしグループが空でなければ最後に追加
    if (groups[noDateGroup].length > 0) {
      sortedDates.push(noDateGroup);
    }
    
    // 各グループ内で開始時間で並び替え
    for (const dateKey in groups) {
      groups[dateKey].sort((a, b) => {
        // 開始時間がない場合は最後に配置
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        
        // 開始時間で比較
        const timeA = new Date(Number(a.startTime) || a.startTime).getTime();
        const timeB = new Date(Number(b.startTime) || b.startTime).getTime();
        
        if (isNaN(timeA) && isNaN(timeB)) return 0;
        if (isNaN(timeA)) return 1;
        if (isNaN(timeB)) return -1;
        
        return timeA - timeB;
      });
    }
    
    return { groups, sortedDates };
  };
  
  // イベントが属する日付グループを取得
  const getEventDateGroup = (eventId: string | number) => {
    const id = String(eventId); // UniqueIdentifierを文字列に変換
    const { groups } = groupEventsByDate();
    
    for (const dateKey in groups) {
      if (groups[dateKey].some(e => e.id === id)) {
        return dateKey;
      }
    }
    return 'no-date'; // nullの代わりにデフォルト値を返す
  };
  
  // 日付を表示用にフォーマットする
  const formatDateHeader = (dateKey: string, index: number) => {
    if (dateKey === 'no-date') {
      return '日付未設定のイベント';
    }
    
    try {
      const date = new Date(dateKey);
      if (!isNaN(date.getTime())) {
        // 月日と曜日を表示
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = dayNames[date.getDay()];
        
        // 何日目かを表示
        return `${index + 1}日目 (${month}月${day}日 ${dayOfWeek})`;
      }
      return dateKey;
    } catch (error) {
      console.error('Error formatting date header:', error, dateKey);
      return dateKey;
    }
  };

  // 移動時間をチェックする関数
  const checkTravelTimes = async () => {
    setIsCheckingTravel(true);
    setTravelConnections({});
    const newConnections: {[key: string]: {status: 'ok' | 'warning' | 'error', travelTime: number}} = {};
    
    try {
      const { groups, sortedDates } = groupEventsByDate();
      
      // 日付未設定のイベントはスキップ
      const datesWithEvents = sortedDates.filter(date => date !== 'no-date');
      
      for (const dateKey of datesWithEvents) {
        const eventsForDate = groups[dateKey];
        
        // 同じ日の連続するイベント間で移動時間をチェック
        for (let i = 0; i < eventsForDate.length - 1; i++) {
          const currentEvent = eventsForDate[i];
          const nextEvent = eventsForDate[i + 1];
          
          // 両方のイベントに住所と時間が設定されている場合のみチェック
          if (currentEvent.location && nextEvent.location && 
              currentEvent.endTime && nextEvent.startTime) {
            
            const connectionId = `${currentEvent.id}-${nextEvent.id}`;
            
            try {
              // 移動時間を計算
              const travelResult = await calculateTravelTime(
                currentEvent.location,
                nextEvent.location,
                TravelMode.driving // デフォルトは車での移動
              );
              
              // 現在のイベントの終了時間
              const endTime = new Date(Number(currentEvent.endTime) || currentEvent.endTime);
              // 次のイベントの開始時間
              const startTime = new Date(Number(nextEvent.startTime) || nextEvent.startTime);
              
              // 移動に必要な時間（秒）
              const travelTimeSeconds = travelResult.duration;
              // 実際に利用可能な時間（ミリ秒）
              const availableTimeMs = startTime.getTime() - endTime.getTime();
              const availableTimeSeconds = availableTimeMs / 1000;
              
              // 余裕を持って移動できるかどうかを判定
              // 移動時間の1.5倍の時間があれば余裕あり、1倍以上1.5倍未満ならギリギリ、1倍未満なら不可
              if (availableTimeSeconds >= travelTimeSeconds * 1.5) {
                newConnections[connectionId] = { status: 'ok', travelTime: travelTimeSeconds };
              } else if (availableTimeSeconds >= travelTimeSeconds) {
                newConnections[connectionId] = { status: 'warning', travelTime: travelTimeSeconds };
              } else {
                newConnections[connectionId] = { status: 'error', travelTime: travelTimeSeconds };
              }
              
            } catch (error) {
              console.error('移動時間計算エラー:', error);
              newConnections[connectionId] = { status: 'error', travelTime: 0 };
            }
          }
        }
      }
      
      setTravelConnections(newConnections);
    } catch (error) {
      console.error('移動時間チェックエラー:', error);
    } finally {
      setIsCheckingTravel(false);
    }
  };
  
  // 移動時間の表示をトグルする
  const toggleTravelCheck = async () => {
    if (!showTravelCheck) {
      // まだ移動時間をチェックしていない場合は計算を実行
      if (Object.keys(travelConnections).length === 0) {
        await checkTravelTimes();
      }
    }
    setShowTravelCheck(!showTravelCheck);
  };
  
  const { groups, sortedDates } = groupEventsByDate();

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-1">
            <FiList className="text-indigo-600" />
            <span>イベント一覧</span>
          </h2>
          <p className="text-gray-500 text-sm">
            ドラッグ＆ドロップでイベントの順序を変更できます
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            className={`flex items-center px-4 py-2 rounded-lg text-sm shadow-sm transition-all duration-300 ${showTravelCheck 
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-md' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            onClick={toggleTravelCheck}
            disabled={isCheckingTravel}
          >
            {isCheckingTravel ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>移動時間チェック中...</span>
              </>
            ) : (
              <>
                <FiMap className="mr-2" />
                <span>{showTravelCheck ? '移動時間表示をオフ' : '移動時間をチェック'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={events.map(e => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {sortedDates.map((dateKey, dateIndex) => (
              <div key={dateKey} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-l-4 border-indigo-500 flex items-center gap-2 shadow-sm">
                  <FiCalendar className="text-indigo-600" />
                  {formatDateHeader(dateKey, dateIndex)}
                </h3>
                <div className="relative">
                  {/* イベント間の接続線を表示 */}
                  {showTravelCheck && dateKey !== 'no-date' && groups[dateKey].length > 1 && groups[dateKey].map((event, idx) => {
                    if (idx < groups[dateKey].length - 1) {
                      const nextEvent = groups[dateKey][idx + 1];
                      const connectionId = `${event.id}-${nextEvent.id}`;
                      const connection = travelConnections[connectionId];
                      
                      if (connection) {
                        let statusBg = 'bg-blue-500'; // デフォルト：青（余裕あり）
                        let statusIcon = <FaCheck className="text-white" />;
                        
                        if (connection.status === 'warning') {
                          statusBg = 'bg-yellow-500'; // 警告：黄色（ギリギリ）
                          statusIcon = <FaExclamationTriangle className="text-white" />;
                        } else if (connection.status === 'error') {
                          statusBg = 'bg-red-500'; // エラー：赤（不可）
                          statusIcon = <FaTimes className="text-white" />;
                        }
                        
                        // 移動時間を表示するツールチップ
                        const minutes = Math.floor(connection.travelTime / 60);
                        const travelTimeText = `${minutes}分`;
                        
                        return (
                          <div key={connectionId} className="w-full flex justify-center my-3">
                            <div className="flex items-center bg-white px-4 py-2 rounded-full border shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                              <div className={`flex items-center justify-center w-7 h-7 rounded-full ${statusBg} mr-3`}>
                                {statusIcon}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{travelTimeText}</span>
                                <span className="text-xs text-gray-500">移動時間</span>
                              </div>
                              <FiArrowDown className="ml-3 text-gray-400" />
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })}
                  
                  {groups[dateKey].map(event => (
                    <div key={event.id}>
                      <EventItem 
                        event={event} 
                        onEdit={handleEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingEvent && (
        <EventModal
          event={editingEvent}
          itineraryId={itineraryId}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}
