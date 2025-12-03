I18n.locale = :en

require "csv"
require "securerandom"
require "fileutils"

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

    now = Time.current

    # Operators
    puts "Importing Operators from the latest CSV..."
    operators_attrs = []

    CSV.foreach(latest_operators_path, headers: true).with_index(1) do |row, i|
      uuid = row["uuid"].presence || SecureRandom.uuid

      operators_attrs << {
        uuid: uuid,
        name: row["name"],
        alias_name: row["alias_name"],
        created_at: now,
        updated_at: now,
      }

      puts "Read #{i} operators..." if (i % 500).zero?
    rescue => e
      puts "Error reading operator at row #{i} (uuid: #{row["uuid"]}): #{e.class} - #{e.message}"
    end

    operator_count = operators_attrs.size

    if operator_count.positive?
      puts "Upserting #{operator_count} operators..."
      Operator.upsert_all(operators_attrs, unique_by: :uuid) # rubocop:disable Rails/SkipsModelValidations
      puts "Operators upserted: #{operator_count}"
    else
      puts "No operator records found in CSV. Skipping operators upsert."
    end

    operator_ids_by_uuid = Operator.where(uuid: operators_attrs.map {|h| h[:uuid] }).
                             pluck(:uuid, :id).
                             to_h

    # Stations
    puts "Importing Stations from the latest CSV..."

    stations_attrs = []
    missing_operator_count = 0

    CSV.foreach(latest_stations_path, headers: true).with_index(1) do |row, i|
      operator_uuid = row["operator_uuid"]
      operator_id = operator_ids_by_uuid[operator_uuid]

      unless operator_id
        puts "Operator UUID not found: #{operator_uuid} (station: #{row["name"]})"
        missing_operator_count += 1
        next
      end

      uuid = row["uuid"].presence || SecureRandom.uuid

      stations_attrs << {
        uuid: uuid,
        name: row["name"],
        name_hiragana: row["name_hiragana"],
        name_romaji: row["name_romaji"],
        latitude: row["latitude"],
        longitude: row["longitude"],
        group_code: row["group_code"],
        operator_id: operator_id,
        created_at: now,
        updated_at: now,
      }

      puts "Read #{i} stations..." if (i % 500).zero?
    rescue => e
      puts "Error reading station at row #{i} (uuid: #{row["uuid"]}, name: #{row["name"]}): #{e.class} - #{e.message}"
    end

    station_count = stations_attrs.size

    if station_count.positive?
      batch_size = 1000
      puts "Upserting #{station_count} stations in batches of #{batch_size}..."

      stations_attrs.each_slice(batch_size).with_index(1) do |slice, batch_index|
        Station.upsert_all(slice, unique_by: :uuid) # rubocop:disable Rails/SkipsModelValidations
        processed = [batch_index * batch_size, station_count].min
        puts "Upserted #{processed} stations..."
      rescue => e
        puts "Error upserting stations in batch #{batch_index}: #{e.class} - #{e.message}"
      end
    else
      puts "No station records found in CSV. Skipping stations upsert."
    end

    puts "Import completed."
    puts "- Operators upserted: #{operator_count}"
    puts "- Stations upserted:  #{station_count}"
    puts "- Stations skipped due to missing operator: #{missing_operator_count}"
    puts "- Source files: #{File.basename(latest_operators_path)}, #{File.basename(latest_stations_path)}"
  end
end
