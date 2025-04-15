/**
 * 場所検索ユーティリティ
 * OpenStreetMap Nominatim APIを使用して場所を検索します
 */

// Window インターフェースを拡張してカスタムプロパティを宣言
declare global {
  interface Window {
    _lastNominatimRequestTime?: number;
  }
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    tourism?: string;
    road?: string;
    neighbourhood?: string;
    quarter?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country: string;
    country_code: string;
    [key: string]: string | undefined;
  };
  boundingbox: string[];
}

/**
 * 場所名から住所を検索する
 * @param query 検索クエリ（場所名）
 * @param language 言語コード（デフォルト: ja）
 * @returns 検索結果
 */
export async function searchLocation(query: string, language: string = 'ja'): Promise<NominatimResult[]> {
  try {
    // APIリクエストの間隔を1秒以上空けるために使用するタイムスタンプ
    const lastRequestTime = window._lastNominatimRequestTime || 0;
    const now = Date.now();
    
    // Nominatim APIの利用規約に従い、リクエスト間隔を1秒以上空ける
    if (now - lastRequestTime < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastRequestTime)));
    }
    
    // URLエンコード
    const encodedQuery = encodeURIComponent(query);
    
    // APIリクエスト
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&accept-language=${language}`,
      {
        headers: {
          'User-Agent': 'Shiori Travel Planner App',
        }
      }
    );
    
    // タイムスタンプを更新
    window._lastNominatimRequestTime = Date.now();
    
    if (!response.ok) {
      throw new Error(`検索に失敗しました: ${response.statusText}`);
    }
    
    const data: NominatimResult[] = await response.json();
    return data;
  } catch (error) {
    console.error('住所検索エラー:', error);
    return [];
  }
}

/**
 * 検索結果から住所文字列を生成する
 * @param result 検索結果
 * @returns フォーマットされた住所
 */
export function formatAddress(result: NominatimResult): string {
  if (!result || !result.address) return '';
  
  const address = result.address;
  let formatted = '';

  // 1. 都道府県
  if (address.state) {
    formatted += address.state;
  }
  
  // 2. 市区町村
  if (address.city) {
    formatted += address.city;
  } else if (address.county) {
    formatted += address.county;
  }
  
  // 3. 町域名 (suburb, quarter, neighbourhood)
  if (address.suburb) {
    formatted += address.suburb;
  } else if (address.quarter) {
    formatted += address.quarter;
  } else if (address.neighbourhood) {
    formatted += address.neighbourhood;
  }

  // 4. 丁目 (road) - 町域名の後に結合することが多い
  // 例: 「渋谷」の後に「2丁目」を結合
  if (address.road) {
    // 丁目が数字で始まっている場合など、適切な区切り文字（例: ハイフン）が必要か検討
    // ここでは単純に連結するが、必要に応じて調整
    formatted += address.road; 
  }

  // 5. 番地 (house_number)
  if (address.house_number) {
    // 番地の前にハイフンなどを入れるか検討 (例: 2-12)
    // ここでは単純に連結
    formatted += address.house_number;
  }

  // 6. 建物名 (building, tourism, attraction)
  if (address.building) {
    // 建物名の前にスペースを入れるか検討
    formatted += address.building;
  } else if (address.tourism) {
    formatted += address.tourism;
  } else if (address.attraction) {
    formatted += address.attraction;
  }

  // display_name があり、より詳細な情報を含む場合はそちらを優先する
  if (result.display_name && result.display_name.length > formatted.length) {
    return result.display_name; 
  }
  
  return formatted;
}

/**
 * 検索結果から座標を取得する
 * @param result 検索結果
 * @returns 緯度経度の配列 [lat, lng]
 */
export function getCoordinates(result: NominatimResult): [number, number] | null {
  if (!result || !result.lat || !result.lon) return null;
  
  try {
    return [parseFloat(result.lat), parseFloat(result.lon)];
  } catch (error) {
    console.error('座標変換エラー:', error);
    return null;
  }
}
