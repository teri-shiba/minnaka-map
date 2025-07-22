require "csv"

namespace :stations do
  desc "Import Operators and Stations from CSV"
  task import: :environment do
    import_dir = Rails.root.join("db", "exported")
    operators_path = import_dir.join("operators.csv")
    stations_path = import_dir.join("stations.csv")

    puts "Operators をインポート中..."
    CSV.foreach(operators_path, headers: true) do |row|
      Operator.find_or_create_by!(name: row["name"]) do |op|
        op.alias_name = row["alias_name"]
      end
    end

    puts "Stations をインポート中..."
    CSV.foreach(stations_path, headers: true) do |row|
      operator = Operator.find_by(name: row["operator_name"])
      Station.find_or_create_by!(name: row["name"], group_code: row["group_code"]) do |station|
        station.name_hiragana = row["name_hiragana"]
        station.name_romaji = row["name_romaji"]
        station.latitude = row["latitude"]
        station.longitude = row["longitude"]
        station.operator = operator
      end
    end

    puts "インポートが完了しました"
  end
end
