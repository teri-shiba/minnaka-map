module OmniauthHelpers
  def set_omniauth_mock(provider, options = {})
    auth_hash = build_default_options.merge(options)
    mock_auth_hash = build_mock_auth_hash(provider, auth_hash)
    setup_controller_mock(mock_auth_hash)

    setup_session_mock(options[:redirect_to]) if options[:redirect_to]
  end

  private

    def build_default_options
      {
        uid: SecureRandom.uuid,
        email: Faker::Internet.email,
        name: Faker::Name.name,
      }
    end

    def build_mock_auth_hash(provider, auth_hash)
      case provider.to_s
      when "google_oauth2"
        build_google_oauth2_hash(auth_hash)
      when "line"
        build_line_hash(auth_hash)
      else
        raise ArgumentError, "Unsupported provider: #{provider}"
      end
    end

    def build_google_oauth2_hash(auth_hash)
      {
        "provider" => "google_oauth2",
        "uid" => auth_hash[:uid],
        "info" => build_google_info_hash(auth_hash),
        "credentials" => build_google_credentials_hash,
      }
    end

    def build_google_info_hash(auth_hash)
      {
        "name" => auth_hash[:name],
        "email" => auth_hash[:email],
        "unverified_email" => auth_hash[:email],
        "email_verified" => true,
        "first_name" => auth_hash[:name].split(" ").first || "First",
        "last_name" => auth_hash[:name].split(" ").last || "Last",
        "image" => "https://example.com/avatar.jpg",
      }
    end

    def build_google_credentials_hash
      {
        "token" => "mock_google_token_#{SecureRandom.hex(8)}",
        "expires_at" => 1.week.from_now.to_i,
        "expires" => true,
        "scope" => "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
      }
    end

    def build_line_hash(auth_hash)
      {
        "provider" => "line",
        "uid" => auth_hash[:uid],
        "info" => build_line_info_hash(auth_hash),
        "credentials" => build_line_credentials_hash,
      }
    end

    def build_line_info_hash(auth_hash)
      {
        "name" => auth_hash[:name],
        "image" => "https://profile.line-scdn.net/#{SecureRandom.hex(8)}",
        "email" => auth_hash[:email],
      }
    end

    def build_line_credentials_hash
      {
        "token" => "mock_line_token_#{SecureRandom.hex(8)}",
        "refresh_token" => "mock_line_refresh_token_#{SecureRandom.hex(8)}",
        "expires_at" => 1.week.from_now.to_i,
        "expires" => true,
      }
    end

    def setup_controller_mock(mock_auth_hash)
      allow_any_instance_of(Api::V1::Auth::OmniauthCallbacksController).
        to receive(:auth_hash).
             and_return(mock_auth_hash)
    end

    def setup_session_mock(redirect_to)
      allow_any_instance_of(Api::V1::Auth::OmniauthCallbacksController).
        to receive(:session).
             and_return({ "omniauth.redirect_to" => redirect_to })
    end
end

RSpec.configure do |config|
  config.include OmniauthHelpers, type: :request

  config.before(:suite) do
    OmniAuth.config.test_mode = true
  end

  config.before(:each, type: :request) do
    Rails.application.env_config["devise.mapping"] = Devise.mappings[:user_auth]
  end

  config.after(:each, type: :request) do
    RSpec::Mocks.space.reset_all
  end
end
