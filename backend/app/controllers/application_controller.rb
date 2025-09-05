class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  include ActionController::Cookies
  include Api::ResponseHelper
  include Api::ExceptionHandler

  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [:user_id])
    end

    def production_env?
      Rails.env.production?
    end

    def sign_coordinates(lat, lng)
      lat_str, lng_str = format_coords(lat, lng)
      expires_at = calc_expires_at
      data       = build_signing_data(lat_str, lng_str, expires_at)
      signature  = hmac_hexdigest(data)

      payload = {
        latitude: lat_str,
        longitude: lng_str,
        signature: signature,
      }

      payload[:expires_at] = expires_at if expires_at
      payload
    end

    def verify_coordinates(lat_str, lng_str, signature, expires_at)
      data = build_signing_data(lat_str, lng_str, expires_at)

      if production_env?
        return false if expires_at.blank?
        return false if Time.zone.at(expires_at.to_i) < Time.current
      end

      expected = hmac_hexdigest(data)
      return false unless signature.bytesize == expected.bytesize

      ActiveSupport::SecurityUtils.secure_compare(expected, signature)
    end

  private

    def format_coords(lat, lng)
      ["%.5f" % lat, "%.5f" % lng]
    end

    def calc_expires_at
      production_env? ? 1.hour.from_now.to_i : nil
    end

    def build_signing_data(lat_str, lng_str, expires_at)
      parts = [lat_str, lng_str]
      parts << expires_at if expires_at
      parts.join(", ")
    end

    def hmac_hexdigest(data)
      OpenSSL::HMAC.hexdigest("SHA256", Rails.application.secret_key_base, data)
    end
end
