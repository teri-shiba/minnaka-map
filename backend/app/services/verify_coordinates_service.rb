class VerifyCoordinatesService
  def initialize(secret: Rails.application.secret_key_base,
                 clock: -> { Time.current })
    @secret     = secret
    @clock      = clock
  end

  def call(lat_in, lng_in, sig = nil, exp = nil)
    return false if sig.blank? || exp.blank?
    return false if Time.zone.at(exp.to_i) < @clock.call

    lat_str = "%.5f" % lat_in.to_f
    lng_str = "%.5f" % lng_in.to_f

    data = [lat_str, lng_str, exp].join(", ")
    expected = OpenSSL::HMAC.hexdigest("SHA256", @secret, data)

    return false unless sig.bytesize == expected.bytesize

    ActiveSupport::SecurityUtils.secure_compare(expected, sig)
  end
end
