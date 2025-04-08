class Api::V1::StationsController < ApplicationController
  def index
    query = params[:q]&.strip
    return render json: { stations: [] } if query.blank?

    stations = Station.search_by_name(query).limit(5)
    render json: {
      stations: stations.map {|s| station_response(s) },
    }
  end

  private

    def station_response(station)
      {
        id: station.id,
        name: station.display_name,
        latitude: station.latitude,
        longitude: station.longitude,
      }
    end
end
