namespace :stations do
  desc "既存の駅名からひらがなとローマ字表記を生成して保存"
  task generate_readings: :environment do
    require "miyabi"

    puts "駅名変換処理を開始します..."
    total = Station.count
    puts "処理対象: #{total}件の駅名"

    count = 0
    success = 0
    error = 0

    # 例外的な読み方をする駅名の対応表（必要に応じて拡充）
    special_readings = {
      #  例: '日本橋' => { hiragana: 'にほんばし', romaji: 'nihonbashi' }
    }

    Station.find_each do |station|
      name = station.name

      begin
        if special_readings[name]
          hiragana = special_readings[name][:hiragana]
          romaji = special_readings[name][:romaji]
        else
          hiragana = name.to_kanhira
          romaji = hiragana.to_roman
        end

        station.update!(
          name_hiragana: hiragana,
          name_romaji: romaji,
        )

        success += 1
      rescue
        puts "エラー (#{count + 1}/#{total}): #{name} - #{e.message}"
        error += 1
      end

      count += 1

      if count % 100 == 0 || count == total
        percentage = (count.to_f / total * 100).round(1)
        puts "進捗: #{count}/#{total} (#{percentage}%) 成功 #{success}, エラー #{error}"
      end
    end

    puts "処理完了！"
    puts "合計: #{total}件"
    puts "成功: #{success}件"
    puts "エラー: #{error}件"

    if error > 0
      puts "注意: 一部の駅名で変換エラーが発生しました。手動でのデータ確認・修正が必要かもしれません。"
    end
  end

  desc "駅名変換結果を確認用CSVとして出力"
  task export_readings_csv: :environment do
    require "csv"

    csv_path = Rails.root.join("tmp", "station_readings.csv")

    puts "駅名と読み方のエクスポートを開始"

    CSV.open(csv_path, "w", encoding: "UTF-8") do |csv|
      csv << ["id", "name", "name_hiragana", "name_romaji", "needs_correction"]

      Station.order(:id).each do |station|
        csv << [
          station.id,
          station.name,
          station.name_hiragana,
          station.name_romaji,
          0,
        ]
      end
    end

    puts "完了！CSVファイルが作成されました: #{csv_path}"
    puts "内容を確認し、必要に応じて 'needs_correction' 列にチェックを入れてください"
  end

  desc "修正済みCSVから駅名読み方を更新"
  task import_corrected_readings: :environment do
    require "csv"

    csv_path = Rails.root.join("data", "station_readings_corrected.csv")

    unless File.exist?(csv_path)
      puts "エラー: #{csv_path} が見つかりません"
      puts "先に export_reading_csv タスクを実行し、出力されたCSVを編集してください"
      puts "編集後のファイルは #{csv_path} として保存してください"
      next
    end

    puts "修正済み読み方データのインポートを開始"
    count = 0

    CSV.foreach(csv_path, headers: true) do |row|
      next if row["needs_correction"] == 0

      station = Station.find_by(id: row["id"])
      if station
        station.update!(
          name_hiragana: row["name_hiragana"],
          name_romaji: row["name_romaji"],
        )
        count += 1
      end
    end

    puts "完了！#{count}件の駅名読み方を更新しました。"
  end
end
