class Api::V1::GooglemapsController < ApplicationController
  def api_key
    render json: { api_key: Rails.application.credentials.google_maps[:api_key] }
  end
end