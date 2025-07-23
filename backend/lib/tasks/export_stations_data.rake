require "csv"

namespace :stations do
  desc "Export Operators and Stations to CSV with date suffix"
  task export: :environment do
    export_operator_dir = Rails.root.join("db", "exported", "operators")
    export_station_dir = Rails.root.join("db", "exported", "stations")
    FileUtils.mkdir_p(export_operator_dir)
    FileUtils.mkdir_p(export_station_dir)

    date_suffix = Time.zone.now.strftime("%Y%m%d_%H%M%S")
    operators_path = export_operator_dir.join("operators_#{date_suffix}.csv")
    stations_path = export_station_dir.join("stations_#{date_suffix}.csv")

    puts "Operators をエクスポート中..."
    CSV.open(operators_path, "w", headers: true) do |csv|
      csv << %w[uuid name alias_name]
      Operator.find_each do |op|
        csv << [op.uuid, op.name, op.alias_name]
      end
    end

    puts "Stations をエクスポート中..."
    CSV.open(stations_path, "w", headers: true) do |csv|
      csv << %w[uuid name name_hiragana name_romaji latitude longitude group_code operator_uuid]
      Station.includes(:operator).find_each do |st|
        csv << [
          st.uuid,
          st.name,
          st.name_hiragana,
          st.name_romaji,
          st.latitude,
          st.longitude,
          st.group_code,
          st.operator&.uuid,
        ]
      end
    end

    puts "エクスポートが完了しました"
    puts "- Operators: #{operators_path}"
    puts "- Stations : #{stations_path}"
  end
end
