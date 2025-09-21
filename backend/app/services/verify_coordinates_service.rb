class VerifyCoordinatesService
  def initialize(secret: Rails.application.secret_key_base,
                 production: Rails.env.production?,
                 clock: -> { Time.current })
    @secret     = secret
    @production = production
    @clock      = clock
  end

  def call(lat_str, lng_str, signature = nil, expires_at = nil)
    unless @production
      return signature.blank?
    end

    return false if signature.blank?
    return false if expires_at.blank?
    return false if Time.zone.at(expires_at.to_i) < @clock.call

    data     = signing_data(lat_str, lng_str, expires_at)
    expected = hmac_hexdigest(data)

    return false unless signature.bytesize == expected.bytesize

    ActiveSupport::SecurityUtils.secure_compare(expected, signature)
  end

  private

    def signing_data(lat_str, lng_str, expires_at)
      [lat_str, lng_str, expires_at].join(", ")
    end

    def hmac_hexdigest(data)
      OpenSSL::HMAC.hexdigest("SHA256", @secret, data)
    end
end
