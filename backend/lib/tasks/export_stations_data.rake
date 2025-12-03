require "csv"
require "fileutils"

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

    puts "Exporting Operators to CSV..."
    operator_count = 0

    CSV.open(operators_path, "w", write_headers: true, headers: %w[uuid name alias_name]) do |csv|
      Operator.find_each.with_index(1) do |op, i|
        csv << [op.uuid, op.name, op.alias_name]
        operator_count += 1

        puts "Exported #{i} operators..." if (i % 500).zero?
      end
    end

    puts "Exporting Stations to CSV..."
    station_count = 0

    CSV.open(
      stations_path,
      "w",
      write_headers: true,
      headers: %w[uuid name name_hiragana name_romaji latitude longitude group_code operator_uuid],
    ) do |csv|
      Station.includes(:operator).find_each.with_index(1) do |st, i|
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
        station_count += 1

        puts "Exported #{i} stations..." if (i % 500).zero?
      end
    end

    puts "Export completed."
    puts "- Operators exported: #{operator_count}"
    puts "- Stations exported:  #{station_count}"
    puts "- Operators CSV path: #{operators_path}"
    puts "- Stations CSV path:  #{stations_path}"
  end
end
