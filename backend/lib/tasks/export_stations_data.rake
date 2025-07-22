require "csv"

namespace :stations do
  desc "Export Operators and Stations to CSV"
  task export: :environment do
    export_dir = Rails.root.join("db", "exported")
    FileUtils.mkdir_p(export_dir)

    operators_path = export_dir.join("operators.csv")
    stations_path = export_dir.join("stations.csv")

    puts "Operators をエクスポート中..."
    CSV.open(operators_path, "w", write_headers: true, headers: %w[name alias_name]) do |csv|
      Operator.find_each do |op|
        csv << [op.name, op.alias_name]
      end
    end

    puts "Stations をエクスポート中..."
    CSV.open(stations_path, "w", write_headers: true, headers: %w[
      name name_hiragana name_romaji latitude longitude group_code operator_name
    ]) do |csv|
      Station.includes(:operator).find_each do |station|
        csv << [
          station.name,
          station.name_hiragana,
          station.name_romaji,
          station.latitude,
          station.longitude,
          station.group_code,
          station.operator&.name,
        ]
      end
    end

    puts "エクスポートが完了しました"
    puts "- Operators: #{operators_path}"
    puts "- Stations: #{stations_path}"
  end
end
