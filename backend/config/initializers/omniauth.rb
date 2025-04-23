return if Rails.env.test?

Rails.application.config.middleware.use OmniAuth::Builder do
  OmniAuth.config.logger = Rails.logger
  provider :google_oauth2,
           Rails.application.credentials.google[:client_id],
           Rails.application.credentials.google[:client_secret]
  require "omniauth/strategies/line"
  provider :line,
           Rails.application.credentials.line[:channel_id],
           Rails.application.credentials.line[:channel_secret],
           scope: "profile openid email"

  OmniAuth.config.allowed_request_methods = %i[get]
  OmniAuth.config.silence_get_warning = true
end
