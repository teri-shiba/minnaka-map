I18n.locale = :en

require "csv"
require "securerandom"

namespace :stations do
  desc "Import the latest-dated Operators and Stations CSV by UUID"
  task import: :environment do
    import_operator_dir = Rails.root.join("db", "exported", "operators")
    import_station_dir = Rails.root.join("db", "exported", "stations")

    latest_operators_path = Dir[import_operator_dir.join("operators_*.csv")].max
    latest_stations_path = Dir[import_station_dir.join("stations_*.csv")].max

    if latest_operators_path.nil? || latest_stations_path.nil?
      puts "Import files were not found."
      exit 1
    end

    puts "Using operator file: #{File.basename(latest_operators_path)}"
    puts "Using station file:  #{File.basename(latest_stations_path)}"

    puts "Importing Operators from the latest CSV..."
    operator_count = 0

    CSV.foreach(latest_operators_path, headers: true).with_index(1) do |row, i|
      uuid = row["uuid"].presence || SecureRandom.uuid
      operator = Operator.find_or_initialize_by(uuid: uuid)
      operator.assign_attributes(
        name: row["name"],
        alias_name: row["alias_name"],
        uuid: uuid,
      )
      operator.save!
      operator_count += 1

      puts "Imported #{i} operators..." if (i % 500).zero?
    rescue => e
      puts "Error importing operator at row #{i} (uuid: #{row["uuid"]}): #{e.class} - #{e.message}"
    end

    puts "Importing Stations from the latest CSV..."
    station_count = 0

    CSV.foreach(latest_stations_path, headers: true).with_index(1) do |row, i|
      operator = Operator.find_by(uuid: row["operator_uuid"])
      unless operator
        puts "Operator UUID not found: #{row["operator_uuid"]} (station: #{row["name"]})"
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
      station_count += 1

      puts "Imported #{i} stations..." if (i % 500).zero?
    rescue => e
      puts "Error importing station at row #{i} (uuid: #{row["uuid"]}, name: #{row["name"]}): #{e.class} - #{e.message}"
    end

    puts "Import completed."
    puts "- Operators imported: #{operator_count}"
    puts "- Stations imported:  #{station_count}"
    puts "- Source files: #{File.basename(latest_operators_path)}, #{File.basename(latest_stations_path)}"
  end
end
