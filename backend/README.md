# 駅・運営会社データの変更運用ドキュメント

このドキュメントは、**駅名・運営会社の変更が発生した場合に、どのようにCSVファイルを編集・運用すべきか**をまとめたものです\。

## 主な変更ケース一覧

| No. | 発生イベント          | 編集対象ファイル                        | 対応方法（内容）                             |
| --- | --------------- | ------------------------------- | ------------------------------------ |
| 1   | 駅名の変更           | `stations.csv`                  | `name` を新しい名称に変更（uuid はそのまま）         |
| 2   | 駅の読み仮名・ローマ字の修正  | `stations.csv`                  | `name_hiragana`, `name_romaji` を修正   |
| 3   | 駅の緯度・経度の修正      | `stations.csv`                  | `latitude`, `longitude` を修正          |
| 4   | グループコードの変更      | `stations.csv`                  | `group_code` を修正                     |
| 5   | 駅の運営会社の変更（移管など） | `stations.csv`, `operators.csv` | `operator_uuid` を差し替える。必要に応じて運営会社を追加 |
| 6   | 運営会社の名称変更       | `operators.csv`                 | `name` を修正（uuid はそのまま）               |
| 7   | 運営会社の別名変更       | `operators.csv`                 | `alias_name` を修正                     |
| 8   | 新駅・新会社の追加       | 両CSV                            | 新しい行を `uuid` 付きで追記                   |


## CSV記述例（変更前後を併記）

### 駅名の変更（渋谷 → 新渋谷）

```csv
# stations_202XXXXX_YYYYYY.csv

uuid,name,name_hiragana,name_romaji,latitude,longitude,group_code,operator_uuid
# 変更前:
6c175081-b9cf-4c29-b23e-3912e9282f07,渋谷,しぶや,shibuya,35.65885,139.70171,003922,b6aa34c1-6b83-4954-811f-d7b6523e2dd2

# 変更後:
6c175081-b9cf-4c29-b23e-3912e9282f07,新渋谷,しぶや,shibuya,35.65885,139.70171,003922,b6aa34c1-6b83-4954-811f-d7b6523e2dd2
```


### 駅の読み・ローマ字の変更

```csv
# stations_202XXXXX_YYYYYY.csv

# 変更前:
...,しぶや,shibuya,...

# 変更後:
...,しんしぶや,shinshibuya,...
```


### 緯度・経度の変更

```csv
# stations_202XXXXX_YYYYYY.csv

# 変更前:
...,35.65885,139.70171,...

# 変更後:
...,35.65900,139.70200,...
```


### グループコードの変更

```csv
# stations_202XXXXX_YYYYYY.csv

# 変更前:
...,003922,...

# 変更後:
...,009999,...
```


### 駅の運営会社を変更（operator\_uuid の差し替え）

```csv
# stations_202XXXXX_YYYYYY.csv

# 変更前:
...,b6aa34c1-6b83-4954-811f-d7b6523e2dd2

# 変更後:
...,a4f9c6b2-9d4f-4fbc-8b0b-df7e9918e7f1
```


### 運営会社の名前の修正（新京成電鉄 → 京成松戸線）

```csv
# operators_202XXXXX_YYYYYY.csv

uuid,name,alias_name
# 変更前:
b6aa34c1-6b83-4954-811f-d7b6523e2dd2,新京成電鉄,新京成電鉄

# 変更後:
b6aa34c1-6b83-4954-811f-d7b6523e2dd2,京成松戸線,京成松戸線
```


### 運営会社の別名（alias\_name）修正

```csv
# operators_202XXXXX_YYYYYY.csv

uuid,name,alias_name
# 変更前:
...,京成松戸線

# 変更後:
...,しんけいせい
```

### 新しい駅を追加する

```csv
# stations_202XXXXX_YYYYYY.csv

uuid,name,name_hiragana,name_romaji,latitude,longitude,group_code,operator_uuid

# 新規追加行（uuid を新規に発行・operator の uuid はコピペ）
（空欄可）,新空港,しんくうこう,shinkuko,35.99999,140.00000,008888,a4f9c6b2-9d4f-4fbc-8b0b-df7e9918e7f1
```

### 新しい運営会社を追加する

```csv
# operators_202XXXXX_YYYYYY.csv

uuid,name,alias_name

# 新規追加行（uuid を新規に発行）
（空欄可）,新運営会社名,新エイリアス
```


## インポートの流れ

1. 上記のルールに従って `stations_YYYYMMDD.csv` および `operators_YYYYMMDD.csv` を編集する
2. ファイルを `/db/exported/stations/` または `/db/exported/operators/` に保存
3. 以下を実行：

```bash
RAILS_ENV=production rails stations:import
```

4. エラーなしで完了すればOK


## 注意事項

* `uuid` は**絶対に変更しない**こと（識別子として使用）
* `name` のみで判断せず、**`uuid`ベースの運用**を徹底
* 古いファイルはバックアップディレクトリなどに保管して履歴を追えるようにする