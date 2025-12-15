![minnaka-map](https://github.com/user-attachments/assets/04d70ded-ef3e-41e8-b508-bac296a5fad0)

# みんなかマップ

公開URL：https://minnaka-map.com

複数人の出発駅から「みんなのまんなか」を自動で算出し、周辺店舗の検索・お気に入り・共有までを一貫して行える Web アプリケーションです。

## サービス概要

友人や同僚と集まる際、以下のような課題を感じたことから本サービスを開発しました。

- 住んでいる場所がバラバラで、集合場所を決めづらい
- 中間地点を調べるのが手間
- 候補店舗を複数人に共有するのが面倒

みんなかマップでは、複数人の出発駅をもとに中間地点を算出し、その周辺の飲食店を **検索・保存・共有** できます。

## デモ（GIF）

（画像を添付）

## 主な機能

- 複数人の出発駅入力による中間地点の自動算出
- 中間地点周辺の飲食店検索（地図 + リスト）
- 条件による絞り込み検索（ジャンル）
- 店舗のお気に入り登録・管理
- お気に入りリストのシェア（URL 共有）

## UI / UX 設計

### 画面一覧

| 画面 | PC | SP | 説明 |
| --- | --- | --- | --- |
| トップページ | ![]()（画像を添付） | ![]() | 出発駅を入力し検索を開始 |
| 検索結果一覧 | ![]()（画像を添付） | ![]() | 地図とリストで候補店舗を表示 |
| お気に入り一覧 | ![]()（画像を添付） | ![]() | 保存した店舗の管理 |
| シェアリスト | ![]()（画像を添付） | ![]() | 共有された候補リストの閲覧 |

### 設計上の工夫

- **入力フォームの UX 改善**
  - 初期表示は 2 人分のみ入力欄を表示
  - 必要に応じて動的に入力欄を追加できる設計
  - 初回利用時の視認性と操作性を重視

- **スマートフォン向け UI 設計**
  - 検索結果ページではドロワー UI を採用
  - 地図操作とリスト選択をシームレスに行える構成
  - PC / SP で役割が異なる UI を意識したレスポンシブ設計

- **認証情報の取り扱い**
  - 認証トークンは LocalStorage ではなく HttpOnly Cookie に保存
  - JavaScript からトークンにアクセスできないため、XSS によるトークン窃取リスクを低減

## 技術スタック

| 領域 | 技術 |
| --- | --- |
| フロントエンド | Next.js ( App Router ), React, TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| フォーム | react-hook-form, zod |
| 地図 | Leaflet, MapTiler |
| データ取得 | SWR, Axios |
| 監視 | Sentry |
| バックエンド | Ruby on Rails ( API ) |
| DB | PostgreSQL |
| 認証 | Devise, devise_token_auth |
| テスト | Vitest, Testing Library, Playwright |
| CI | GitHub Actions |
| 開発環境 | Docker, Figma |


## ディレクトリ構成（Components）

フロントエンドのコンポーネントは、
**機能（ドメイン）単位で整理** しています。

```text
frontend/src/components
├── features          # 機能・ドメイン単位の UI
│   ├── account
│   ├── favorite
│   ├── guide-carousel
│   ├── map
│   ├── restaurant
│   └── station
├── layout            # 共通レイアウト
└── ui                # 汎用 UI コンポーネント
```

## 設計資料

### ER 図

<img width="800" height="800" alt="241027_ER" src="https://github.com/user-attachments/assets/6097993c-f442-43c0-9cd5-4fd8ad32524f" />

### 画面遷移図

<img width="800" height="auto" alt="251215_screen-flow" src="https://github.com/user-attachments/assets/16a249f9-68f6-404b-803e-a11d0c2b9f68" />

### UI 設計

外部リンク ( Figma ): https://figmashort.link/HQEHDF

### インフラ構成図

（画像を添付）

## 今後の課題

本アプリでは基本的な機能実装を優先して開発しており、
今後は体験品質と保守性の向上に取り組みたいと考えています。

- Storybook を導入し、UI コンポーネント単位でのテスト・可視化を行う
- 検索実行後、結果ページへ遷移するまでの体感速度改善
  - 外部 API（地図・店舗情報）リクエストの待ち時間短縮
  - Skeleton UI をより早い段階で表示する設計への改善
- 再検索可能な画面の追加
- 絞り込み条件の拡充による UX 向上
