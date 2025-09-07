# frozen_string_literal: true

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
    expires_at = @production ? (@clock.call + 1.hour).to_i : nil
    data       = signing_data(lat_str, lng_str, expires_at)
    signature  = hmac_hexdigest(data)

    payload = {
      latitude: lat_str,
      longitude: lng_str,
      signature: signature,
    }

    payload[:expires_at] = expires_at if expires_at
    payload
  end

  private

    def format_coords(lat, lng)
      ["%.5f" % lat, "%.5f" % lng]
    end

    def signing_data(lat_str, lng_str, expires_at)
      parts = [lat_str, lng_str]
      parts << expires_at if @production
      parts.join(", ")
    end

    def hmac_hexdigest(data)
      OpenSSL::HMAC.hexdigest("SHA256", @secret, data)
    end
end
