if Rails.env.test? || (Rails.env.development? && ENV["ENABLE_OMNIAUTH_TEST_MODE"] == "true")
  OmniAuth.config.test_mode = true
  OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new({
    provider: "google_oauth2",
    uid: "12345678",
    info: {
      email: "e2e@test.com",
      name: "E2E Test User",
    },
  })
end

OMNIAUTH_SETUP_PROC = ->(env) do
  request = Rack::Request.new(env)
  redirect_to = request.params["redirect_to"]

  if redirect_to
    env["omniauth.strategy"].options[:authorize_params] ||= {}
    env["rack.session"]["omniauth.state"] || SecureRandom.hex(24)
    env["rack.session"]["omniauth.redirect_to"] = redirect_to
  end
end

Rails.application.config.middleware.use OmniAuth::Builder do
  OmniAuth.config.logger = Rails.logger

  if Rails.env.test? || (Rails.env.development? && ENV["ENABLE_OMNIAUTH_TEST_MODE"] == "true")
    require "omniauth/strategies/line"
    provider :line, "dummy_id", "dummy_secret", setup: OMNIAUTH_SETUP_PROC
    provider :google_oauth2, "dummy_id", "dummy_secret", setup: OMNIAUTH_SETUP_PROC
  else
    provider :google_oauth2,
             Rails.application.credentials.google[:client_id],
             Rails.application.credentials.google[:client_secret],
             setup: OMNIAUTH_SETUP_PROC

    require "omniauth/strategies/line"
    provider :line,
             Rails.application.credentials.line[:channel_id],
             Rails.application.credentials.line[:channel_secret],
             scope: "profile openid email",
             setup: OMNIAUTH_SETUP_PROC
  end

  OmniAuth.config.allowed_request_methods = %i[get]
  OmniAuth.config.silence_get_warning = true
end
