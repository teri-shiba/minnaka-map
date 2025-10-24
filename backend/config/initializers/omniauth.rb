Rails.application.config.middleware.use OmniAuth::Builder do
  OmniAuth.config.logger = Rails.logger

  setup_proc = ->(env) do
    request = Rack::Request.new(env)
    redirect_to = request.params["redirect_to"]

    if redirect_to
      env["omniauth.strategy"].options[:authorize_params] ||= {}

      env["rack.session"]["omniauth.state"] || SecureRandom.hex(24)

      env["rack.session"]["omniauth.redirect_to"] = redirect_to
    end
  end

  if Rails.env.test?
    require "omniauth/strategies/line"
    provider :line, "dummy_id", "dummy_secret", setup: setup_proc
    provider :google_oauth2, "dummy_id", "dummy_secret", setup: setup_proc
  else
    provider :google_oauth2,
             Rails.application.credentials.google[:client_id],
             Rails.application.credentials.google[:client_secret],
             setup: setup_proc

    require "omniauth/strategies/line"
    provider :line,
             Rails.application.credentials.line[:channel_id],
             Rails.application.credentials.line[:channel_secret],
             scope: "profile openid email",
             setup: setup_proc
  end

  OmniAuth.config.allowed_request_methods = %i[get]
  OmniAuth.config.silence_get_warning = true
end
