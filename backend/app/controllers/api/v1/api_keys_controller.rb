class Api::V1::ApiKeysController < Api::V1::BaseController
  before_action :verify_internal_token!

  SUPPORTED_SERVICES = {
    "hotpepper" => :hotpepper,
    "maptiler" => :map_tiler,
    "googlemaps" => :google_maps,
  }.freeze

  def show
    service_key = params[:service].to_s.strip.downcase

    unless SUPPORTED_SERVICES.has_key?(service_key)
      return render_error("サポートされていないサービスです", status: :bad_request)
    end

    credentials_key = SUPPORTED_SERVICES.fetch(service_key)
    api_key = Rails.application.credentials.dig(credentials_key, :api_key).to_s.strip

    if api_key.present?
      render_success(data: { api_key: api_key })
    else
      Rails.logger.error("サービス '#{service_key}' のAPIキー未設定 request_id=#{request.request_id}")
      render_error("APIキーが設定されていません", status: :internal_server_error)
    end
  end

  private

    def verify_internal_token!
      provided_token = request.headers["X-Internal-Token"].to_s
      expected_token = Rails.application.credentials.internal_api_token.to_s

      is_valid = provided_token.present? &&
                 expected_token.present? &&
                 ActiveSupport::SecurityUtils.secure_compare(provided_token, expected_token)

      return if is_valid

      Rails.logger.warn("内部APIトークン検証失敗 request_id=#{request.request_id} ip=#{request.remote_ip} path=#{request.fullpath}")
      render_error("アクセスが拒否されました", status: :forbidden)
    end
end
