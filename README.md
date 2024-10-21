# minnaka map（みんなかマップ）
みんなかマップは、みんなの出発地点から集まりやすい中間地点とその周辺の飲食店を提案するアプリです。

TODO: OGP 画像を貼る

## サービス URL

TODO: URL を貼る

## ユーザーが抱える課題

- 友人と遊びに行く予定があるが、場所選びに時間がかかってしまう
- みんなが集まりやすい場所を選びたいが、最適な場所がわからない
- 周りに気を遣ってしまい積極的な提案はできないので、集まりやすい場所を提案したい

## アプリケーションのイメージ
TODO: GIF 画像を貼る

## 機能一覧
TODO: 開発完了後、画像を貼る

|トップ画面|ログイン画面|
|---|---|
|画像|画像|
|説明|説明|

|検索結果一覧|検索詳細画面|
|---|---|
|画像|画像|
|説明|説明|

|絞り込み機能|お気に入り一覧|
|---|---|
|画像|画像|
|説明|説明|

|個別シェア|一覧シェア|
|---|---|
|画像|画像|
|説明|説明|

## 使用技術（予定）

|領域|技術やツール|
|---|---|
|デザイン／設計|Figma<br>Storybook|
|スタイル|shadcn/ui|
|フロントエンド|React v0.0.0<br>Next.js v0.0.0<br>TypeScript v0.0.0|
|バックエンド|Ruby v0.0.0<br>Ruby on Rails API v0.0.0|
|データベース|PostgreSQL|
|インフラ|Render.com<br>Vercel|
|API|Google Maps JavaScript API<br>Google Places API<br>Google Geolocation API|
|CI / CD|GithubActions|
|開発環境|Docker|
|npm|ESLint<br>Prettier<br>Axios<br>SWR<br>React Hook Form<br>Framer-Motion<br>React Google Maps API|
|gem|<br>Devise<br>devise-i18n<br>Devise Token Auth<br>OmniAuth<br>ActiveHash<br>pry-rails<br>RSpec<br>Factorybot<br>Faker<br>letter_opener_web<br>RuboCop|

## ER図
![Entity Relationships](https://github.com/user-attachments/assets/8fdaaf9a-fa2b-497f-a014-ea9dd5a6808b)

### テーブル一覧

|テーブル名|定義|
|---|---|
|users|ユーザー情報|
|user_auth|ユーザーの認証情報|
|search_results|出発地点の検索履歴|
|stores|店舗情報|
|favorites|お気に入りをした店舗情報|

## 画面遷移図

![Screen Transition Diagram](https://github.com/teri-shiba/minnaka-map/assets/155863891/2317317e-4b4b-47c0-9401-fa8a69913cbd)

https://figmashort.link/Zr5rwH

## UI 設計

https://figmashort.link/HQEHDF

## インフラ構成図
## 工夫した点
## 今後の課題