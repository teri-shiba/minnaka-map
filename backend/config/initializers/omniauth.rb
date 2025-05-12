Rails.application.config.middleware.use OmniAuth::Builder do
  OmniAuth.config.logger = Rails.logger

  if Rails.env.test?
    require "omniauth/strategies/line"
    provider :line, "dummy_id", "dummy_secret"
    provider :google_oauth2, "dummy_id", "dummy_secret"
  else
    provider :google_oauth2,
             Rails.application.credentials.google[:client_id],
             Rails.application.credentials.google[:client_secret]

    require "omniauth/strategies/line"
    provider :line,
             Rails.application.credentials.line[:channel_id],
             Rails.application.credentials.line[:channel_secret],
             scope: "profile openid email"
  end

  OmniAuth.config.allowed_request_methods = %i[get]
  OmniAuth.config.silence_get_warning = true
end
