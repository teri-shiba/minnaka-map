class Api::V1::ApiKeysController < Api::V1::BaseController
  before_action :verify_internal_token!

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

  private

    def verify_internal_token!
      provided_token = request.headers["X-Internal-Token"].to_s
      expected_token = Rails.application.credentials.internal_api_token.to_s

      is_valid = provided_token.present? &&
                 expected_token.present? &&
                 ActiveSupport::SecurityUtils.secure_compare(provided_token, expected_token)

      unless is_valid
        Rails.logger.warn "invalid internal token attempt from #{request.remote_ip}"
        render_error("Forbidden", :forbidden)
      end
    end
end
