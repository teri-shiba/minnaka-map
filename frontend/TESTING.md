## テスト目的（今回の範囲）

本プロジェクトで現時点において実施するテストの目的は **機能テスト（インタラクションテスト）に限定**します。非機能テスト（例: アクセシビリティ/A11y）は将来の導入対象とし、今回は範囲外です。

> 参考: 書籍『フロントエンド開発のためのテスト入門』の考え方を踏まえ、まずユーザー操作とユースケースの保証を優先

## スコープ定義（何を測るか）

### 含める（=テスト/カバレッジ対象）

* 条件分岐・データ加工・非同期処理・副作用がある**機能ロジック**
* 複数フック/サービスの**統合**（例: `useAuth` + `react-hook-form` + `zod`）
* ルーティング/ナビゲーション・フォーム検証・状態管理・検索/サジェスト・共有/お気に入り等

### 除外（=対象外）

* **静的表示**のみのコンポーネント（見出し、空状態、固定フッター等）
* **見た目専用/装飾のみ**（`framer-motion` での演出等）
* **外部レンダラ薄ラッパー**（Leaflet/MapTiler のレイヤ、単純マーカー等）
* **UI ラッパー**（Dialog/Drawer/Button の素通し）
* **ベンダー由来/生成コード**（shadcn のユーティリティ等）

## テスト対象外ファイル一覧

**対象外ファイル**とその理由を一覧化します。

| ファイル                                                              | 区分                | 理由                             | ファイル記載コメント                                                 |
| ----------------------------------------------------------------- | ----------------- | ------------------------------ | ------------------------------------------------------ |
| utils/cn.ts                                                       | vendor            | ベンダー由来（shadcn/ui）             | `/* c8 ignore start -- vendor code（出典: shadcn/ui） */` |
| components/features/guide-carousel/guide-heading.tsx              | visual            | 静的見出しのみ                       | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/features/guide-carousel/guide-description.tsx          | visual            | props→表示の単純構造                 | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/features/guide-carousel/guide-image.tsx                | visual            | framer-motion + 画像表示（視覚確認で十分） | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/features/guide-carousel/guide-step.tsx                 | visual            | framer-motion + 単純ボタン         | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/features/station/search/buttons/add-form-button.tsx    | ui-wrapper        | 単純ボタン（UI ラッパー）                | `/* c8 ignore start -- UI コンポーネントの薄いラッパー */`          |
| components/features/station/search/buttons/remove-form-button.tsx | ui-wrapper        | 単純ボタン（UI ラッパー）                | `/* c8 ignore start -- UI コンポーネントの薄いラッパー */`          |
| components/features/station/search/buttons/reset-form-button.tsx  | ui-wrapper        | 単純ボタン（UI ラッパー）                | `/* c8 ignore start -- UI コンポーネントの薄いラッパー */`          |
| components/account/delete/delete-account-dialog.tsx               | ui-wrapper        | Dialog UI の薄いラッパー             | `/* c8 ignore start -- UI コンポーネントの薄いラッパー */`          |
| components/account/delete/delete-account-drawer.tsx               | ui-wrapper        | Drawer UI の薄いラッパー             | `/* c8 ignore start -- UI コンポーネントの薄いラッパー */`          |
| components/map/map-canvas.tsx                                     | external-renderer | 地図描画（外部レンダラ委譲）                | `/* c8 ignore start -- 外部レンダラ（地図/レイヤ/マーカー等）の委譲 */`    |
| components/map/map-layer.tsx                                      | external-renderer | MapTiler の統合薄ラッパー             | `/* c8 ignore start -- 外部レンダラ（地図/レイヤ/マーカー等）の委譲 */`    |
| components/map/map-restaurant-card.tsx                            | external-renderer | 単純マーカー表示                      | `/* c8 ignore start -- 外部レンダラ（地図/レイヤ/マーカー等）の委譲 */`    |
| components/map/midpoint-marker.tsx                                | external-renderer | 単純マーカー表示                      | `/* c8 ignore start -- 外部レンダラ（地図/レイヤ/マーカー等）の委譲 */`    |
| components/map/restaurant-marker.tsx                              | external-renderer | 単純マーカー表示                      | `/* c8 ignore start -- 外部レンダラ（地図/レイヤ/マーカー等）の委譲 */`    |
| components/restaurant/restaurant-drawer-container.tsx             | visual            | framer-motion の装飾             | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/restaurant/restaurant-empty.tsx                        | visual            | 空状態の静的表示                      | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/restaurant/restaurant-list-body.tsx                    | visual            | 単純なレンダリングロジック                 | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/restaurant/restaurant-list-footer.tsx                  | visual            | 単純なフッター表示                     | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/restaurant/restaurant-sidebar-container.tsx            | visual            | 単純なコンテナ                       | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/layout/section.tsx                                     | visual            | 単純なレイアウトラッパー                  | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |
| components/footer/section.tsx                                     | visual            | 条件付きクラス適用のみ（視覚的変化）                  | `/* c8 ignore start -- 視覚のみ/薄いラッパー */`            |

> **注意**: 将来これらのファイルに `if/switch`、配列処理、副作用、外部呼び出し等の**ロジック**が追加された場合は、対象外コメントを削除し、相応のテストを追加すること
