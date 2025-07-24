class Api::V1::ApiKeysController < ApplicationController
  SUPPORTED_SERVICE = {
    "hotpepper" => :hotpepper,
    "maptiler" => :map_tiler,
    "googlemaps" => :google_maps,
  }.freeze

  def show
    service_key = params[:service]

    unless SUPPORTED_SERVICE.has_key?(service_key)
      return render_error("サポートされていないサービスです", :bad_request)
    end

    credentials_key = SUPPORTED_SERVICE[service_key]
    api_key = Rails.application.credentials.dig(credentials_key, :api_key)

    if api_key.present?
      render_success(api_key: api_key)
    else
      Rails.logger.error "API key not found for service: #{service_key}"
      render_error("APIキーが設定されていません", :internal_server_error)
    end
  end

  private

    def render_success(api_key:)
      render json: { api_key: api_key }, status: :ok
    end

    def render_error(message, status)
      render json: { error: message }, status: :status
    end
end
