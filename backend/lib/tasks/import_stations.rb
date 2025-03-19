require "json"
require "bigdecimal"

class ImportStations
  FILE_PATH = Rails.root.join("db", "data", "N02-23_Station.geojson")

  def self.run
    station_data = JSON.parse(File.read(FILE_PATH))
    grouped_data = parse_features(station_data)
    final_locations = calculate_group_averages(grouped_data)
    save_station_to_db(final_locations)
  end

  def self.parse_features(station_data)
    grouped_data = Hash.new {|hash, key| hash[key] = { name: nil, coords: [] } }

    station_data["features"].each do |feature|
      properties = feature["properties"]
      geometry = feature["geometry"]
      coords = geometry["coordinates"]
      group_code = properties["N02_005g"]
      station_name = properties["N02_005"]

      coords.each do |lng, lat|
        grouped_data[group_code][:coords] << [lat, lng]
      end

      grouped_data[group_code][:name] ||= station_name
    end

    grouped_data
  end

  def self.calculate_group_averages(grouped_data)
    grouped_data.transform_values do |data|
      coords = data[:coords]
      name = data[:name]

      lat_sum = coords.map {|lat, _| BigDecimal(lat.to_s) }.sum
      lng_sum = coords.map {|_, lng| BigDecimal(lng.to_s) }.sum
      count = coords.size

      lat_avg = (lat_sum / count).to_f.round(5)
      lng_avg = (lng_sum / count).to_f.round(5)

      { name: name, lat: lat_avg, lng: lng_avg }
    end
  end

  def self.save_station_to_db(final_locations)
    final_locations.each_value do |info|
      next if info[:name].blank?

      Station.find_or_create_by!(name: info[:name]) do |station|
        station.latitude = info[:lat]
        station.longitude = info[:lng]
      end
    end
  end
end
