class Api::V1::ApiKeysController < Api::V1::BaseController
  SUPPORTED_SERVICE = {
    "hotpepper" => :hotpepper,
    "maptiler" => :map_tiler,
    "googlemaps" => :google_maps,
  }.freeze

  def show
    service_key = params[:service].to_s

    unless SUPPORTED_SERVICE.has_key?(service_key)
      return render_error("サポートされていないサービスです", :bad_request)
    end

    credentials_key = SUPPORTED_SERVICE[service_key]
    raw = Rails.application.credentials.dig(credentials_key, :api_key)
    api_key = raw.to_s.strip

    if api_key.present?
      render_success(data: { api_key: api_key })
    else
      Rails.logger.error "API key not found for service: #{service_key}"
      render_error("APIキーが設定されていません", :internal_server_error)
    end
  end
end
