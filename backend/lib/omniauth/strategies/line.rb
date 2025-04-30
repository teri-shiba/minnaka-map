require "omniauth-oauth2"
require "jwt"
require "securerandom"

module OmniAuth
  module Strategies
    class Line < OmniAuth::Strategies::OAuth2
      option :name, "line"

      option :client_options, {
        site: "https://api.line.me",
        authorize_url: "https://access.line.me/oauth2/v2.1/authorize",
        token_url: "/oauth2/v2.1/token",
      }

      option :authorize_options, [:scope, :prompt, :nonce]
      option :prompt, "consent"

      uid { raw_info["userId"] || raw_info["sub"] }

      info do
        hash = {
          name: raw_info["displayName"],
          image: raw_info["pictureUrl"],
        }

        hash[:email] = raw_info["email"] if email_scope? && raw_info["email"]
        hash
      end

      extra do
        {
          raw_info: raw_info,
        }
      end

      def callback_phase
        if request.params["code"].nil?
          fail!("authorization_code_missing")
        else
          super
        end
      end

      def client
        ::OAuth2::Client.new(
          options.client_id.to_s,
          options.client_secret.to_s,
          deep_symbolize(options.client_options),
        )
      end

      def raw_info
        @raw_info ||= begin
          profile = access_token.get(
            "v2/profile",
            headers: { "Authorization" => "Bearer #{access_token.token}" },
          ).parsed

          if (id_token = access_token.params["id_token"])
            begin
              id_info = JWT.decode(id_token, nil, false).first
              profile["sub"] = id_info["sub"] if id_info["sub"]
              profile["email"] = id_info["email"] if id_info["email"]
            rescue JWT::DecodeError => e
              warn "[OmniAuth::Line] JWT decode failed: #{e.message}"
              profile.delete("email") if email_scope?
            end
          end
          profile
        end
      end

      def callback_url
        full_host + callback_path
      end

      private

        def auth_hash
          OmniAuth.config.mock_auth[:line] || super
        end

        def authorize_params
          super.tap do |params|
            params[:nonce] = SecureRandom.uuid
          end
        end

        def email_scope?
          scopes = (options[:scope] || options.scope || "").to_s.split
          scopes.include?("email")
        end
    end
  end
end
