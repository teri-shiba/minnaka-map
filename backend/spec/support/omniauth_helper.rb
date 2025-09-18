module OmniauthHelpers
  def omniauth_callback_path_for(action, provider)
    url_for(only_path: true,
            controller: "api/v1/auth/omniauth_callbacks",
            action: action,
            provider: provider)
  end

  def omniauth_redirect_callback_path(provider)
    omniauth_callback_path_for(:redirect_callbacks, provider)
  end

  def omniauth_success_callback_path(provider)
    omniauth_callback_path_for(:omniauth_success, provider)
  end

  def build_auth(uid:, email:, name:, provider: "google_oauth2")
    OmniAuth::AuthHash.new(provider:, uid:, info: { email:, name: })
  end

  def start_omniauth_flow(provider:, auth_hash:)
    get omniauth_redirect_callback_path(provider),
        env: {
          "omniauth.auth" => auth_hash,
          "omniauth.params" => { "namespace_name" => "api_v1",
                                 "resource_class" => "UserAuth" },
        }

    if ENV["RSPEC_DEBUG"] == "1"
      warn "[DEBUG] redirect_callbacks: status=#{response.status} location=#{response.location.inspect}"
    end
    expect(response).to be_redirect
  end

  def parse_location!
    uri = URI(response.location)
    [uri, Rack::Utils.parse_nested_query(uri.query)]
  end

  def expect_front_redirect(status:, message: nil)
    expect(response).to have_http_status(:found)

    if ENV["RSPEC_DEBUG"] == "1"
      warn "[DEBUG] front_redirect: status=#{response.status} location=#{response.location.inspect}"
    end

    uri, q = parse_location!
    expect(uri.path).to eq("/")
    expect(q["status"]).to eq(status)
    expect(q["message"]).to eq(message) if message
  end
end

RSpec.configure do |config|
  config.include OmniauthHelpers, type: :request

  config.before(:suite) do
    next unless ENV["RSPEC_DEBUG"] == "1"

    $stdout.puts "[DEBUG] OmniAuth.allowed_request_methods=#{OmniAuth.config.allowed_request_methods.inspect}"
  end

  config.around(:each, type: :request) do |ex|
    prev = OmniAuth.config.test_mode
    OmniAuth.config.test_mode = true
    begin
      ex.run
    ensure
      OmniAuth.config.mock_auth.clear
      OmniAuth.config.test_mode = prev
    end
  end
end
