class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  include ActionController::Cookies

  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [:user_id])
    end

    def sign_coordinates(lat, lng)
      data = "#{lat}, #{lng}"
      OpenSSL::HMAC.hexdigest("SHA256", Rails.application.secret_key_base, data)
    end

    def varify_coodinates(lat, lng, signature)
      expected = sign_coordinates(lat, lng)
      ActiveSupport::SecurityUtils.secure_compare(expected, signature)
    end
end
