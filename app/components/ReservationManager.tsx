'use client';

import React, { useState, useEffect } from 'react';
import { 
  fetchEventReservation, 
  createReservation, 
  updateReservation, 
  deleteReservation 
} from '../../lib/client-api';
import { Reservation, ReservationType, ReservationStatus, RESERVATION_TYPES, RESERVATION_STATUSES } from '../../lib/models';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Event } from '../../lib/models';
import { 
  FaPlane, 
  FaHotel, 
  FaCar, 
  FaHiking, 
  FaUtensils, 
  FaTrain, 
  FaBus, 
  FaShip, 
  FaTicketAlt,
  FaCalendarCheck,
  FaExclamationTriangle
} from 'react-icons/fa';

interface ReservationManagerProps {
  eventId: string;
  itineraryId: string;
  event: Event;
  onReservationChange?: (reservation: Reservation | null) => void;
}

// 予約タイプに対応するアイコンを取得
const getReservationIcon = (type: ReservationType) => {
  switch (type) {
    case 'flight': return FaPlane;
    case 'hotel': return FaHotel;
    case 'rentalCar': return FaCar;
    case 'activity': return FaHiking;
    case 'restaurant': return FaUtensils;
    case 'train': return FaTrain;
    case 'bus': return FaBus;
    case 'ferry': return FaShip;
    default: return FaTicketAlt;
  }
};

// 予約ステータスに対応する色を取得
const getStatusColor = (status: ReservationStatus) => {
  const statusObj = RESERVATION_STATUSES.find(s => s.id === status);
  if (!statusObj) return 'gray';
  
  return statusObj.color;
};

export default function ReservationManager({ eventId, itineraryId, event, onReservationChange }: ReservationManagerProps) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // 新規予約用の状態
  const [newReservation, setNewReservation] = useState({
    type: 'flight' as ReservationType,
    status: 'notBooked' as ReservationStatus,
    confirmationNumber: '',
    provider: '',
    bookingDate: '',
    price: '',
    currency: 'JPY',
    notes: '',
    contactInfo: '',
    attachmentUrls: [] as string[]
  });
  
  // 予約情報を取得
  useEffect(() => {
    const loadReservation = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        const data = await fetchEventReservation(eventId);
        setReservation(data);
        
        // 既存の予約があれば、編集用のフォームにセット
        if (data) {
          setNewReservation({
            type: data.type,
            status: data.status,
            confirmationNumber: data.confirmationNumber || '',
            provider: data.provider || '',
            bookingDate: data.bookingDate || '',
            price: data.price ? String(data.price) : '',
            currency: data.currency || 'JPY',
            notes: data.notes || '',
            contactInfo: data.contactInfo || '',
            attachmentUrls: data.attachmentUrls || []
          });
        }
      } catch (error) {
        console.error('予約情報の取得に失敗しました', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReservation();
  }, [eventId]);
  
  // 予約の作成または更新
  const handleSaveReservation = async () => {
    try {
      // 価格を数値に変換
      const price = newReservation.price ? parseFloat(newReservation.price) : undefined;
      
      // 予約データを準備
      const reservationData = {
        ...newReservation,
        price,
        eventId,
        itineraryId
      };
      
      let result;
      
      if (reservation) {
        // 既存の予約を更新
        result = await updateReservation(reservation.id, reservationData);
      } else {
        // 新規予約を作成
        result = await createReservation(reservationData);
      }
      
      setReservation(result);
      setIsDialogOpen(false);
      
      // 親コンポーネントに変更を通知
      if (onReservationChange) {
        onReservationChange(result);
      }
    } catch (error) {
      console.error('予約の保存に失敗しました', error);
      alert('予約の保存に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    }
  };
  
  // 予約の削除
  const handleDeleteReservation = async () => {
    if (!reservation) return;
    
    try {
      await deleteReservation(reservation.id);
      setReservation(null);
      setIsDeleteDialogOpen(false);
      
      // 親コンポーネントに変更を通知
      if (onReservationChange) {
        onReservationChange(null);
      }
    } catch (error) {
      console.error('予約の削除に失敗しました', error);
      alert('予約の削除に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    }
  };
  
  // イベントタイプに基づいて予約が必要かどうかを判定
  const requiresReservation = () => {
    // アイコン名から判断
    const reservationRequiredIcons = ['plane', 'train', 'hotel', 'bus', 'ship'];
    
    // タイトルから判断
    const reservationKeywords = [
      '航空', 'フライト', '飛行機', 'flight', 'airplane', 'plane',  // 航空関連
      'ホテル', '宿', '旅館', '民宿', 'hotel', 'stay', 'accommodation', // 宿泊関連
      '電車', '新幹線', '特急', 'train', 'railway', 'express', 'shinkansen', // 鉄道関連
      'フェリー', 'ferry', 'ship', 'boat', // 船関連
      'バス', 'bus', // バス関連
    ];
    
    // アイコンチェック
    if (event.icon && reservationRequiredIcons.includes(event.icon)) {
      return true;
    }
    
    // タイトルチェック
    if (event.title) {
      const lowerTitle = event.title.toLowerCase();
      for (const keyword of reservationKeywords) {
        if (lowerTitle.includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }
    
    // 説明チェック
    if (event.description) {
      const lowerDesc = event.description.toLowerCase();
      for (const keyword of reservationKeywords) {
        if (lowerDesc.includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // 予約ステータスに基づいて表示するコンポーネント
  const ReservationStatusIndicator = () => {
    // 予約が必要なイベントかチェック
    if (!requiresReservation() && !reservation) {
      return null; // 予約が必要なイベントでない場合は何も表示しない
    }
    
    if (!reservation) {
      return (
        <div 
          className="flex items-center text-gray-600 cursor-pointer hover:text-blue-500"
          onClick={() => {
            setNewReservation({
              ...newReservation,
              status: 'notBooked'
            });
            setIsDialogOpen(true);
          }}
        >
          <FaExclamationTriangle className="mr-1 text-yellow-500" size={14} />
          <span className="text-sm">予約が必要です</span>
        </div>
      );
    }
    
    const StatusIcon = reservation.status === 'confirmed' || reservation.status === 'paid' || reservation.status === 'completed'
      ? FaCalendarCheck
      : FaExclamationTriangle;
    
    const statusObj = RESERVATION_STATUSES.find(s => s.id === reservation.status);
    const statusName = statusObj ? statusObj.name : reservation.status;
    const statusColor = getStatusColor(reservation.status);
    
    const typeObj = RESERVATION_TYPES.find(t => t.id === reservation.type);
    const typeName = typeObj ? typeObj.name : reservation.type;
    
    const ReservationIcon = getReservationIcon(reservation.type as ReservationType);
    
    return (
      <div 
        className="flex flex-col cursor-pointer hover:bg-gray-50 p-1 rounded"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex items-center">
          <ReservationIcon className="mr-1 text-blue-500" size={14} />
          <span className="text-sm font-medium">{typeName}</span>
        </div>
        <div className="flex items-center mt-1">
          <StatusIcon 
            className={`mr-1 text-${statusColor}-500`} 
            size={14} 
          />
          <span className="text-sm">{statusName}</span>
        </div>
        {reservation.provider && (
          <div className="text-xs text-gray-600 mt-1">
            {reservation.provider}
          </div>
        )}
        {reservation.confirmationNumber && (
          <div className="text-xs text-gray-600">
            予約番号: {reservation.confirmationNumber}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      <ReservationStatusIndicator />
      
      {/* 予約編集ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {reservation ? '予約情報の編集' : '予約情報の登録'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reservationType">予約タイプ</Label>
              <Select
                value={newReservation.type}
                onValueChange={(value: ReservationType) => 
                  setNewReservation({ ...newReservation, type: value })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="予約タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  {RESERVATION_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reservationStatus">予約ステータス</Label>
              <Select
                value={newReservation.status}
                onValueChange={(value: ReservationStatus) => 
                  setNewReservation({ ...newReservation, status: value })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="予約ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  {RESERVATION_STATUSES.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider">予約先 / サービス提供者</Label>
              <Input
                id="provider"
                value={newReservation.provider}
                onChange={(e) => setNewReservation({ ...newReservation, provider: e.target.value })}
                placeholder="例: JAL、ヒルトンホテル、JR東日本"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmationNumber">予約番号 / 確認番号</Label>
              <Input
                id="confirmationNumber"
                value={newReservation.confirmationNumber}
                onChange={(e) => setNewReservation({ ...newReservation, confirmationNumber: e.target.value })}
                placeholder="例: ABC123456"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bookingDate">予約日</Label>
              <Input
                id="bookingDate"
                type="date"
                value={newReservation.bookingDate}
                onChange={(e) => setNewReservation({ ...newReservation, bookingDate: e.target.value })}
                className="h-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">価格</Label>
                <Input
                  id="price"
                  type="number"
                  value={newReservation.price}
                  onChange={(e) => setNewReservation({ ...newReservation, price: e.target.value })}
                  placeholder="例: 15000"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">通貨</Label>
                <Select
                  value={newReservation.currency}
                  onValueChange={(value) => setNewReservation({ ...newReservation, currency: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="通貨を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPY">日本円 (JPY)</SelectItem>
                    <SelectItem value="USD">米ドル (USD)</SelectItem>
                    <SelectItem value="EUR">ユーロ (EUR)</SelectItem>
                    <SelectItem value="GBP">英ポンド (GBP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactInfo">連絡先情報</Label>
              <Input
                id="contactInfo"
                value={newReservation.contactInfo}
                onChange={(e) => setNewReservation({ ...newReservation, contactInfo: e.target.value })}
                placeholder="例: 電話番号、メールアドレスなど"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">メモ</Label>
              <Textarea
                id="notes"
                value={newReservation.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewReservation({ ...newReservation, notes: e.target.value })}
                placeholder="予約に関する追加情報"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div>
              {reservation && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="mr-2"
                >
                  削除
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={handleSaveReservation}
              >
                保存
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              予約情報の削除
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>この予約情報を削除してもよろしいですか？</p>
            <p className="text-sm text-gray-500 mt-2">この操作は元に戻せません。</p>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="mr-2"
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteReservation}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
