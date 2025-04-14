import { NextRequest, NextResponse } from 'next/server';
import { calculateTravelTime, TravelMode } from '../../../../lib/route-api';

export async function GET(request: NextRequest) {
  try {
    // URLパラメータから出発地と目的地を取得
    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const modeParam = searchParams.get('mode');
    const mode = modeParam && Object.values(TravelMode).includes(modeParam as TravelMode)
      ? modeParam as TravelMode
      : TravelMode.driving;

    // パラメータのバリデーション
    if (!origin || !destination) {
      return NextResponse.json(
        { error: '出発地と目的地の両方を指定してください' },
        { status: 400 }
      );
    }

    // 移動時間を計算
    // ジオコーディングとルート計算はすべてORS APIエンドポイントで処理される
    const result = await calculateTravelTime(origin, destination, mode);

    return NextResponse.json({
      ...result,
      originAddress: origin,
      destinationAddress: destination
    });
  } catch (error) {
    console.error('Travel time calculation error:', error);
    const errorMessage = error instanceof Error ? error.message : '移動時間の計算中にエラーが発生しました';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
