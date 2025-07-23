I18n.locale = :en

require "csv"

namespace :stations do
  desc "Import the latest-dated Operators and Stations CSV by UUID"
  task import: :environment do
    import_operator_dir = Rails.root.join("db", "exported", "operators")
    import_station_dir = Rails.root.join("db", "exported", "stations")

    latest_operators_path = Dir[import_operator_dir.join("operators_*.csv")].max
    latest_stations_path = Dir[import_station_dir.join("stations_*.csv")].max

    if latest_operators_path.nil? || latest_stations_path.nil?
      puts "インポートファイルが見つかりませんでした。"
      exit 1
    end

    puts "最新ファイルで Operators をインポート中..."
    CSV.foreach(latest_operators_path, headers: true) do |row|
      uuid = row["uuid"].presence || SecureRandom.uuid
      operator = Operator.find_or_initialize_by(uuid: uuid)
      operator.assign_attributes(
        name: row["name"],
        alias_name: row["alias_name"],
        uuid: uuid,
      )
      operator.save!
    end

    puts "最新ファイルで Stations をインポート中..."
    CSV.foreach(latest_stations_path, headers: true) do |row|
      operator = Operator.find_by(uuid: row["operator_uuid"])
      unless operator
        puts "Operator UUIDが見つかりません: #{row["operator_uuid"]}（駅: #{row["name"]}）"
        next
      end

      uuid = row["uuid"].presence || SecureRandom.uuid
      station = Station.find_or_initialize_by(uuid: uuid)
      station.assign_attributes(
        name: row["name"],
        name_hiragana: row["name_hiragana"],
        name_romaji: row["name_romaji"],
        latitude: row["latitude"],
        longitude: row["longitude"],
        group_code: row["group_code"],
        operator: operator,
        uuid: uuid,
      )
      station.save!
    end

    puts "インポートが完了しました"
    puts "- 使用ファイル: #{File.basename(latest_operators_path)}, #{File.basename(latest_stations_path)}"
  end
end
