
// 移動手段の列挙型
export enum TravelMode {
  driving = 'driving-car',
  walking = 'foot-walking',
  cycling = 'cycling-regular',
  transit = 'public-transport'
}

/**
 * 2点間の移動時間を計算する - Bun最適化版
 * @param origin 出発地の住所
 * @param destination 目的地の住所
 * @param mode 移動手段（デフォルトは自動車）
 * @returns 移動時間（秒）と距離（メートル）
 */
export async function calculateTravelTime(
  origin: string,
  destination: string,
  mode: TravelMode = TravelMode.driving
): Promise<{ duration: number; distance: number; durationText: string; distanceText: string }> {
  try {
    // Bunの最適化されたfetchを使用
    const response = await fetch('/api/ors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ origin, destination, mode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `APIリクエストに失敗しました: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      duration: data.duration,
      distance: data.distance,
      durationText: data.durationText,
      distanceText: data.distanceText,
    };

  } catch (error: any) {
    console.error('移動時間の計算中にエラーが発生しました:', error);
    // エラーオブジェクトをそのままスローするか、カスタムエラーをスローする
    throw new Error(error.message || '移動時間の計算に失敗しました');
  }
}
