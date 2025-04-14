This app is a personal project and is **not** suitable for commercial use.

# 旅程管理アプリ「しおり」

このアプリケーションは、旅行の計画を立てるための旅程管理アプリです。イベントの追加、編集、削除、並び替え、日付ごとのグループ化などの機能を提供します。

## 機能

- 旅程（しおり）の作成、編集、削除
  - インライン編集機能（タイトルをクリックして直接編集）
  - 専用編集ページでの編集
- イベントの追加、編集、削除
  - 場所・住所情報の保存と表示
  - 時間設定と表示
- ドラッグ＆ドロップによるイベントの並び替え
- 日付ごとのイベントのグループ化
- 移動時間チェック機能
  - イベント間の移動時間計算（国土地理院APIとOpenRouteService APIを使用）
  - 移動可能性の視覚的表示（青：余裕あり、黄：ギリギリ、赤：不可）
  - 移動時間の表示
- 旅程のエクスポート/インポート（JSON形式）

## 技術スタック

- Next.js 15
- TypeScript
- SQLite（better-sqlite3）
- Tailwind CSS
- React Icons
- 国土地理院ジオコーディングAPI（住所→座標変換）
- OpenRouteService API（経路計算）

## 開始方法

### 環境変数の設定

1. プロジェクトのルートディレクトリに `.env.local` ファイルを作成します
2. 以下の内容を追加します：

```
NEXT_PUBLIC_ORS_API_KEY=あなたのOpenRouteServiceAPIキー
```

### OpenRouteService APIキーの取得方法

1. [OpenRouteService](https://openrouteservice.org/) にアクセスし、アカウントを作成します
2. ログイン後、[Dashboard](https://openrouteservice.org/dev/#/home) にアクセスします
3. 「Sign up for a token」をクリックしてAPIキーを取得します
4. 取得したAPIキーを `.env.local` ファイルに設定します

### インストールと開発サーバーの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスして、アプリケーションを使用できます。

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 技術スタック

- [Next.js](https://nextjs.org) - Reactフレームワーク
- [SQLite](https://www.sqlite.org/) (better-sqlite3) - データベース
- [Tailwind CSS](https://tailwindcss.com) - スタイリング
- [dnd-kit](https://dndkit.com/) - ドラッグ＆ドロップ機能
- [OpenRouteService](https://openrouteservice.org/) - 移動時間計算API