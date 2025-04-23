# lib/omniauth/strategies/line.rb
require "omniauth-oauth2"
require "jwt"

module OmniAuth
  module Strategies
    class Line < OmniAuth::Strategies::OAuth2
      option :name, "line"

      option :client_options, {
        site: "https://api.line.me",
        authorize_url: "https://access.line.me/oauth2/v2.1/authorize",
        token_url: "/oauth2/v2.1/token",
      }

      # LINE専用のパラメータをデフォルトで設定
      option :authorize_options, [:scope, :prompt, :nonce]
      option :prompt, "consent"

      uid { raw_info["userId"] || raw_info["sub"] }

      info do
        {
          name: raw_info["displayName"],
          image: raw_info["pictureUrl"],
          email: raw_info["email"],
        }
      end

      extra do
        {
          raw_info: raw_info,
        }
      end

      # client_idとclient_secretを文字列に変換する
      def client
        ::OAuth2::Client.new(
          options.client_id.to_s,
          options.client_secret.to_s,
          deep_symbolize(options.client_options),
        )
      end

      def raw_info
        @raw_info ||= access_token.get("v2/profile", headers: { "Authorization" => "Bearer #{access_token.token}" }).parsed

        # メールアドレスをid_tokenから取得
        if options[:scope].include?("email")
          id_token = access_token.params["id_token"]
          if id_token
            id_token_info = JWT.decode(id_token, nil, false)[0]
            @raw_info["email"] = id_token_info["email"]
            @raw_info["sub"] = id_token_info["sub"]
          end
        end

        @raw_info
      end

      def callback_url
        full_host + callback_path
      end

      private

        def authorize_params
          super.tap do |params|
            params[:nonce] = SecureRandom.uuid
          end
        end
    end
  end
end
