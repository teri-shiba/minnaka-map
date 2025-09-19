class VerifyCoordinatesService
  def initialize(secret: Rails.application.secret_key_base,
                 production: Rails.env.production?,
                 clock: -> { Time.current })
    @secret     = secret
    @production = production
    @clock      = clock
  end

  def call(lat_str, lng_str, signature, expires_at = nil)
    if !@production && signature.blank?
      return true
    end

    return false if signature.blank?

    if @production
      return false if expires_at.blank?
      return false if Time.zone.at(expires_at.to_i) < @clock.call
    end

    data = signing_data(lat_str, lng_str, expires_at)
    expected = hmac_hexdigest(data)

    return false unless signature.bytesize == expected.bytesize

    ActiveSupport::SecurityUtils.secure_compare(expected, signature)
  end

  private

    def signing_data(lat_str, lng_str, expires_at)
      parts = [lat_str, lng_str]
      parts << expires_at if @production
      parts.join(", ")
    end

    def hmac_hexdigest(data)
      OpenSSL::HMAC.hexdigest("SHA256", @secret, data)
    end
end
