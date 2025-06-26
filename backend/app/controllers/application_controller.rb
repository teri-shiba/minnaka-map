class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  include ActionController::Cookies

  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [:user_id])
    end

    def sign_coordinates(lat, lng)
      lat_str = "%.5f" % lat
      lng_str = "%.5f" % lng

      if Rails.env.production?
        expires_at = 1.hour.from_now.to_i
        data = "#{lat_str}, #{lng_str}, #{expires_at}"
      else
        expires_at = nil
        data = "#{lat_str}, #{lng_str}"
      end

      signature = OpenSSL::HMAC.hexdigest(
        "SHA256",
        Rails.application.secret_key_base,
        data,
      )
      {
        latitude: lat_str,
        longitude: lng_str,
        signature: signature,
        expires_at: expires_at,
      }
    end

    def verify_coordinates(lat_str, lng_str, signature, expires_at)
      if Rails.env.production?
        return false if expires_at.blank?
        return false if Time.zone.at(expires_at.to_i) < Time.current

        data = "#{lat_str}, #{lng_str}, #{expires_at}"
      else
        data = "#{lat_str}, #{lng_str}"
      end

      expected = OpenSSL::HMAC.hexdigest(
        "SHA256",
        Rails.application.secret_key_base,
        data,
      )

      return false unless signature.bytesize == expected.bytesize

      ActiveSupport::SecurityUtils.secure_compare(expected, signature)
    end
end
