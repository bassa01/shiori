'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { Event } from '../../lib/models';
import { FaCompass } from 'react-icons/fa';

// Leafletのスタイルをインポート
import 'leaflet/dist/leaflet.css';

// Leafletのデフォルトアイコンを修正
// アイコンのパスを直接指定する方法に変更

// Leafletの型定義は必要なもののみ使用

// 座標を持つイベントの型
interface EventWithCoords extends Event {
  latitude: number;
  longitude: number;
}

// マップコントローラー（地図の表示範囲を調整）
function MapController({ locations }: { locations: Event[] }) {
  const map = useMap();

  useEffect(() => {
    // 有効な座標を持つイベントをフィルタリング
    const validLocations = locations.filter(
      (loc): loc is EventWithCoords => 
        typeof loc.latitude === 'number' && !isNaN(loc.latitude) &&
        typeof loc.longitude === 'number' && !isNaN(loc.longitude)
    );

    if (validLocations.length > 0) {
      const bounds = new L.LatLngBounds(validLocations.map(loc => [loc.latitude, loc.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (validLocations.length === 1) {
        // 1つのポイントしかない場合は、そのポイントを中心に表示
        map.setView([validLocations[0].latitude, validLocations[0].longitude], 14);
      }
    } else {
      // 有効な座標がない場合はデフォルトビュー（日本）
      map.setView([35.6812, 139.7671], 5);
    }
  }, [locations, map]);

  return null; // このコンポーネントは何も表示しない
}

// 現在地ボタンなどのマップコントロール
function MapControls({ map }: { map: L.Map | null }) {
  const centerOnCurrentLocation = () => {
    if (!map) return;
    map.locate({ setView: true, maxZoom: 16 });
    
    // 位置情報取得成功時の処理
    const onLocationFound = (e: L.LocationEvent) => {
      if (map) {
        L.circleMarker(e.latlng, { radius: 8, color: 'blue', fillColor: '#2a64e0', fillOpacity: 0.8 })
          .addTo(map)
          .bindPopup("現在地 (おおよその位置)")
          .openPopup();
      }
      map?.off('locationfound', onLocationFound);
      map?.off('locationerror', onLocationError);
    };

    // 位置情報取得失敗時の処理
    const onLocationError = (e: L.ErrorEvent) => {
      alert(`現在地の取得に失敗しました: ${e.message}`);
      map?.off('locationfound', onLocationFound);
      map?.off('locationerror', onLocationError);
    };

    // リスナーを登録
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
  };

  return (
    <div className="leaflet-bottom leaflet-right mb-10 mr-2">
      <div className="leaflet-control leaflet-bar">
        <a
          className="leaflet-control-zoom-in"
          href="#"
          title="現在地を表示"
          role="button"
          aria-label="現在地を表示"
          onClick={(e) => { e.preventDefault(); centerOnCurrentLocation(); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <FaCompass size={16} />
        </a>
      </div>
    </div>
  );
}

// MapClientコンポーネント
export default function MapClient({ events }: { events: Event[] }) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Leafletのアイコンを初期化
  useEffect(() => {
    // Leafletのデフォルトアイコンを修正
    // LeafletのアイコンURL取得メソッドを削除
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    // Next.jsでは直接URLを指定する
    L.Icon.Default.mergeOptions({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
    });
  }, []);

  // 有効な座標を持つイベントをフィルタリング
  const validLocationsForMarkers = useMemo(() => {
    return events.filter(
      (loc): loc is EventWithCoords => 
        typeof loc.latitude === 'number' && !isNaN(loc.latitude) &&
        typeof loc.longitude === 'number' && !isNaN(loc.longitude)
    );
  }, [events]);

  const defaultCenter: LatLngExpression = [35.6812, 139.7671]; // デフォルトは東京

  return (
    <>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        ref={(mapRef: L.Map | null) => setMapInstance(mapRef)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validLocationsForMarkers.map((loc) => (
          <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
            <Popup>
              <div className="font-semibold text-base mb-1">{loc.title}</div>
              {loc.eventDate && <div className="text-sm">日付: {loc.eventDate}</div>}
              {loc.startTime && <div className="text-sm">時間: {loc.startTime}{loc.endTime ? ` - ${loc.endTime}` : ''}</div>}
              {loc.description && <div className="text-xs mt-2 border-t pt-1 text-gray-600">{loc.description}</div>}
            </Popup>
          </Marker>
        ))}
        <MapController locations={events} />
      </MapContainer>
      <MapControls map={mapInstance} />
    </>
  );
}
