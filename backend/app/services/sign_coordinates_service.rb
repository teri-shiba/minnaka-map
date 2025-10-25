class SignCoordinatesService
  def initialize(secret: Rails.application.secret_key_base,
                 clock: -> { Time.current })
    @secret     = secret
    @clock      = clock
  end

  def call(lat, lng)
    lat_str, lng_str = format_coords(lat, lng)
    exp = (@clock.call + 1.hour).to_i
    data = signing_data(lat_str, lng_str, exp)
    sig  = hmac_hexdigest(data)

    { lat: lat_str, lng: lng_str, sig:, exp: }
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
