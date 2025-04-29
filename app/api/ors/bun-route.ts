import { NextRequest, NextResponse } from 'next/server';
import OpenRouteService from 'openrouteservice-js';

// 移動手段の列挙型（route-api.tsからもインポート可能ですが、念のためここにも定義）
enum TravelMode {
  driving = 'driving-car',
  walking = 'foot-walking',
  cycling = 'cycling-regular',
  transit = 'public-transport'
}

/**
 * 住所から座標を取得する（国土地理院API使用）- Bun最適化版
 */
async function geocodeAddress(address: string): Promise<[number, number]> {
  try {
    console.log(`ジオコーディング実行: 住所="${address}"`);
    
    // 国土地理院のジオコーディングAPIを使用
    const encodedAddress = encodeURIComponent(address);
    const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodedAddress}`;
    
    console.log(`国土地理院APIリクエスト: ${url}`);
    
    // Bunの最適化されたfetchを使用
    const gsiResponse = await fetch(url);
    if (!gsiResponse.ok) {
      throw new Error(`国土地理院APIエラー: ${gsiResponse.status} ${gsiResponse.statusText}`);
    }
    
    const gsiData = await gsiResponse.json();
    console.log('国土地理院APIレスポンス:', JSON.stringify(gsiData, null, 2));
    
    if (!gsiData || gsiData.length === 0) {
      throw new Error(`住所「${address}」に対応する座標が見つかりませんでした`);
    }
    
    // 国土地理院APIは[経度, 緯度]の形式で座標を返す
    const coordinates = gsiData[0].geometry.coordinates;
    console.log(`座標取得成功: [${coordinates[0]}, ${coordinates[1]}] (経度, 緯度)`);
    
    // OpenRouteServiceも[経度, 緯度]の形式を使用するのでそのまま返す
    return coordinates as [number, number];
  } catch (error: unknown) {
    console.error('ジオコーディングエラー:', error);
    if (error instanceof Error && error.message) {
      throw new Error(`住所のジオコーディングに失敗しました: ${error.message}`);
    }
    throw new Error('住所のジオコーディングに失敗しました: 不明なエラー');
  }
}

/**
 * 時間のフォーマット
 */
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}時間${minutes > 0 ? ` ${minutes}分` : ''}`;
  } else {
    return `${minutes}分`;
  }
};

/**
 * 距離のフォーマット
 */
const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  } else {
    return `${Math.round(meters)}m`;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { origin, destination, mode } = await request.json();
    console.log(`リクエスト受信: origin="${origin}", destination="${destination}", mode=${mode}`);

    const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;

    if (!apiKey) {
      console.error('APIキーが設定されていません');
      return NextResponse.json({ error: 'OpenRouteService APIキーが設定されていません。' }, { status: 500 });
    }

    console.log('APIキー確認: 設定されています');

    if (!origin || !destination || !mode) {
      return NextResponse.json({ error: 'origin, destination, modeが必要です。' }, { status: 400 });
    }

    // 座標を取得 - Bunの最適化されたfetchを使用
    const originCoords = await geocodeAddress(origin);
    const destCoords = await geocodeAddress(destination);

    // ルート検索 - Bunの最適化
    const directions = new OpenRouteService.Directions({ api_key: apiKey });
    const response = await directions.calculate({
      coordinates: [originCoords, destCoords],
      profile: mode as TravelMode,
      format: 'json',
      units: 'km',
      language: 'ja',
      instructions: false
    });

    if (!response || !response.routes || response.routes.length === 0) {
      return NextResponse.json({ error: 'ルート検索に失敗しました' }, { status: 500 });
    }

    const route = response.routes[0];
    const duration = route.summary.duration; // 秒単位
    const distance = route.summary.distance * 1000; // メートル単位に変換

    return NextResponse.json({
      duration,
      distance,
      durationText: formatDuration(duration),
      distanceText: formatDistance(distance)
    });
  } catch (error: unknown) {
    console.error('ORS APIルートエラー:', error);
    if (error instanceof Error && error.message) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: '計算中にエラーが発生しました' }, { status: 500 });
  }
}
