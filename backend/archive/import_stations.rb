require "json"
require "bigdecimal"

IMPORT_LOGGER = Logger.new(Rails.root.join("log", "import_stations.log"))

class OperatorImporter
  def self.import(file_path)
    station_data = JSON.parse(File.read(file_path))
    operators = extract_operators(station_data)
    create_operators(operators)
    set_operator_aliases
  end

  def self.extract_operators(station_data)
    operators = Set.new
    station_data["features"].each do |feature|
      operators << feature["properties"]["N02_004"]
    end
    operators
  end

  def self.create_operators(operators)
    operators.each do |operator_name|
      next if operator_name.blank?

      begin
        Operator.find_or_create_by!(name: operator_name)
      rescue => e
        IMPORT_LOGGER.debug "Error creating operator '#{operator_name}': #{e.message}"
      end
    end
  end

  def self.set_operator_aliases
    # 運営会社名が分かりにくいものは別名で管理
    aliases = YAML.load_file(Rails.root.join("config", "operator_aliases.yml"))

    aliases.each do |name, alias_name|
      operator = Operator.find_by(name: name)
      operator.update!(alias_name: alias_name) if operator
    end
  end
end

class StationDataProcessor
  def self.parse_features(station_data)
    grouped_data = initialize_grouped_data
    process_features(station_data, grouped_data)
    log_parsing_results(grouped_data)
    grouped_data
  end

  def self.initialize_grouped_data
    Hash.new do |hash, key|
      hash[key] = {
        name: nil,
        coords: [],
        operators: Set.new,
        group_code: key,
      }
    end
  end

  def self.process_features(station_data, grouped_data)
    IMPORT_LOGGER.debug "Total features in GeoJSON: #{station_data["features"].size}"
    feature_with_empty_operator = 0

    station_data["features"].each do |feature|
      properties = feature["properties"]
      geometry = feature["geometry"]
      coords = geometry["coordinates"]
      group_code = properties["N02_005g"]
      station_name = properties["N02_005"]
      operator_name = properties["N02_004"]

      feature_with_empty_operator += 1 if operator_name.blank?

      process_coordinates(grouped_data, group_code, coords)
      store_station_info(grouped_data, group_code, station_name, operator_name)
    end

    IMPORT_LOGGER.debug "Features with empty operator: #{feature_with_empty_operator}"
  end

  def self.process_coordinates(grouped_data, group_code, coords)
    coords.each do |lng, lat|
      grouped_data[group_code][:coords] << [lat, lng]
    end
  end

  def self.store_station_info(grouped_data, group_code, station_name, operator_name)
    grouped_data[group_code][:name] ||= station_name
    grouped_data[group_code][:operators] << operator_name if operator_name.present?
  end

  def self.log_parsing_results(grouped_data)
    IMPORT_LOGGER.debug "Total unique group codes: #{grouped_data.size}"

    groups_without_operators = grouped_data.select {|_, data| data[:operators].empty? }
    IMPORT_LOGGER.debug "Groups without any operators: #{groups_without_operators.size}"

    if groups_without_operators.any?
      IMPORT_LOGGER.debug "Example groups without operators:"
      groups_without_operators.first(5).each do |code, data|
        IMPORT_LOGGER.debug " - Group #{code}: #{data[:name]}"
      end
    end
  end

  def self.calculate_group_averages(grouped_data)
    grouped_data.transform_values do |data|
      coords = data[:coords]
      name = data[:name]

      calculate_average_coordinates(coords, name, data)
    end
  end

  def self.calculate_average_coordinates(coords, name, data)
    lat_sum = coords.map {|lat, _| BigDecimal(lat.to_s) }.sum
    lng_sum = coords.map {|_, lng| BigDecimal(lng.to_s) }.sum
    count = coords.size

    lat_avg = (lat_sum / count).to_f.round(5)
    lng_avg = (lng_sum / count).to_f.round(5)

    {
      name: name,
      lat: lat_avg,
      lng: lng_avg,
      operators: data[:operators].to_a,
      group_code: data[:group_code],
    }
  end
end

class StationSaver
  CORRECTED_CSV_PATH = Rails.root.join("db", "data", "station_readings_corrected.csv")

  def self.save_stations(final_locations)
    readings = load_readings_csv

    stations_with_operator = 0
    stations_without_operator = 0

    skipped = []

    final_locations.each_value do |info|
      next if info[:name].blank?

      operator = find_operator(info)
      readings_row = readings[info[:name]]

      if readings_row.present?
        info[:name_hiragana] = readings_row[:name_hiragana]
        info[:name_romaji] = readings_row[:name_romaji]
      end

      stations_with_operator, stations_without_operator = process_station(info, operator, stations_with_operator, stations_without_operator,
                                                                          skipped)
    end

    if skipped.any?
      IMPORT_LOGGER.debug "=== スキップされた駅一覧（#{skipped.size}件） ==="
      skipped.each {|name| puts "- #{name}" }
    end

    log_station_counts(stations_with_operator, stations_without_operator)
  end

  def self.process_station(info, operator, with_op, without_op, skipped)
    if operator.present?
      with_op += 1
    else
      without_op += 1
      log_missing_operator(info)
    end

    if info[:name_hiragana].blank? || info[:name_romaji].blank?
      IMPORT_LOGGER.debug "読みデータが見つかりません: #{info[:name]}"
      return [with_op, without_op]
    end

    unless create_station_safe(info, operator)
      skipped << info[:name]
    end

    [with_op, without_op]
  end

  def self.create_station_safe(info, operator)
    create_station(info, operator)
    true
  rescue ActiveRecord::RecordInvalid => e
    message = "RecordInvalid: #{info[:name]} -> #{e.record.errors.full_messages.join(", ")} -> スキップします"
    IMPORT_LOGGER.debug message
    IMPORT_LOGGER.warn message
    false
  end

  def self.load_readings_csv
    require "csv"
    result = {}

    CSV.foreach(CORRECTED_CSV_PATH, headers: true, encoding: "UTF-8") do |row|
      next if row["name"].blank?

      result[row["name"]] = {
        name_hiragana: row["name_hiragana"],
        name_romaji: row["name_romaji"],
      }
    end
    result
  end

  def self.create_station(info, operator)
    Station.find_or_create_by!(name: info[:name], group_code: info[:group_code]) do |station|
      station.latitude = info[:lat]
      station.longitude = info[:lng]
      station.operator = operator
      station.name_hiragana = info[:name_hiragana]
      station.name_romaji = info[:name_romaji]
    end
  end

  def self.find_operator(info)
    main_operator_name = info[:operators].first
    return nil if main_operator_name.blank?

    operator = Operator.find_by(name: main_operator_name)
    if operator.nil?
      IMPORT_LOGGER.debug "Warning: Operator '#{main_operator_name}' not found for station #{info[:name]}"
    end
    operator
  end

  def self.log_missing_operator(info)
    IMPORT_LOGGER.debug "Station without operator: #{info[:name]} (group: #{info[:group_code]})"
  end

  def self.log_station_counts(with_operator, without_operator)
    IMPORT_LOGGER.debug "Stations with operator: #{with_operator}"
    IMPORT_LOGGER.debug "Stations without operator: #{without_operator}"
  end
end

class ImportStations
  FILE_PATH = Rails.root.join("db", "data", "N02-23_Station.geojson")

  def self.run
    OperatorImporter.import(FILE_PATH)

    station_data = JSON.parse(File.read(FILE_PATH))
    grouped_data = StationDataProcessor.parse_features(station_data)
    final_locations = StationDataProcessor.calculate_group_averages(grouped_data)
    StationSaver.save_stations(final_locations)
  end
end
