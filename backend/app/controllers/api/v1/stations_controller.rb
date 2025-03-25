class Api::V1::StationsController < ApplicationController
  def index
    query = params[:q]&.strip
    return render json: { station: [] } if query.blank?

    stations = Station.where("name ILIKE ?", "%#{query}").limit(5)
    render json: { stations: stations.map {|s| { id: s.id, name: s.name, latitude: s.latitude, longitude: s.longitude } } }
  end
end
