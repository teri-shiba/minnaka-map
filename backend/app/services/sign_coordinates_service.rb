class SignCoordinatesService
  def initialize(secret: Rails.application.secret_key_base,
                 production: Rails.env.production?,
                 clock: -> { Time.current })
    @secret     = secret
    @production = production
    @clock      = clock
  end

  def call(lat, lng)
    lat_str, lng_str = format_coords(lat, lng)

    return { latitude: lat_str, longitude: lng_str } unless @production

    expires_at = (@clock.call + 1.hour).to_i
    data       = signing_data(lat_str, lng_str, expires_at)
    signature  = hmac_hexdigest(data)

    { latitude: lat_str, longitude: lng_str, signature:, expires_at: }
  end

  private

    def format_coords(lat, lng)
      ["%.5f" % lat, "%.5f" % lng]
    end

    def signing_data(lat_str, lng_str, expires_at)
      [lat_str, lng_str, expires_at].join(", ")
    end

    def hmac_hexdigest(data)
      OpenSSL::HMAC.hexdigest("SHA256", @secret, data)
    end
end
