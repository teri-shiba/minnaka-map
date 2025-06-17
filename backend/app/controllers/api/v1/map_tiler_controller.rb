class Api::V1::MapTilerController < ApplicationController
  def api_key
    render json: { api_key: Rails.application.credentials.map_tiler[:api_key] }
  end
end
