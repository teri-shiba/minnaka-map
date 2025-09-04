class Api::V1::StationsController < ApplicationController
  def index
    query = params[:q]&.strip
    return render json: { stations: [] } if query.blank?

    stations = Station.search_by_name(query).limit(5)
    render json: {
      stations: ActiveModelSerializers::SerializableResource.new(
        stations, each_serializer: StationIndexSerializer
      ).as_json,
    }
  end
end
