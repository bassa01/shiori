// Import from our Bun-optimized route API adapter
import { TravelMode, calculateTravelTime } from './bun-route-api';

// Re-export the types and functions
export { TravelMode, calculateTravelTime };

/**
 * 住所から座標を取得する
 * @param address 住所
 * @returns 座標 [経度, 緯度]
 */
// 住所から座標を取得する機能はAPIルート側に統合されたため、この関数は不要になります。
// 必要であればAPIルート経由でジオコーディングのみを行うエンドポイントを追加することも可能です。

/*
export async function geocodeAddress(address: string): Promise<[number, number]> {
  // ... (実装は削除)
}
*/
