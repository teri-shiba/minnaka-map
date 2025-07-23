# アーカイブファイルについて

このディレクトリは、初期データ構築のために使用していたスクリプトやデータファイルを保管しています。
現在の運用では不要となったため、将来の参考や履歴確認のためにアーカイブしています。

## 構成

### `import_stations.rb`
初期開発時に使用した、GeoJSON ファイルをパースして駅情報と運営会社情報をDBに登録するためのスクリプトです。
現在は CSV ベースでの運用に移行したため使用していません。

### `stations.rake`
GeoJSONからインポートした駅情報に、読み仮名（ひらがな／ローマ字）を追加する補助的な Rake タスクです。
`station_readings_corrected.csv` を元に更新していました。

## data/

### `data/N02-23_Station.geojson`
国土交通省が公開している鉄道駅データ（2023年版）です。
`import_stations.rb` のインポート元として使用していました。

### `data/station_readings_corrected.csv`
駅名に対応する読み仮名（ひらがな／ローマ字）の補完ファイルです。
`stations.rake` で使用していました。

## config/

### `config/operator_aliases.yml`
運営会社名のゆらぎ（表記揺れ）を統一するためのマッピングファイルです。
`import_stations.rb` 内で参照されていました。

## 備考

現在は `stations.csv` および `operators.csv` を用いたCSVベースのインポート方式に完全移行しています。
今後のデータ修正・追加はCSVファイルに対して直接行ってください。
