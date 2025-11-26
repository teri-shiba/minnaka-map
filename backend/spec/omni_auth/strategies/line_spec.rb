require "rails_helper"
require "omniauth"
require "rack"
require "oauth2"
require_relative "../../../lib/omniauth/strategies/line.rb"

RSpec.describe OmniAuth::Strategies::Line, type: :strategy do
  subject(:strategy) do
    OmniAuth::Strategies::Line.new(app, "channel_id", "secret", options).tap do |stg|
      allow(stg).to receive(:request).and_return(request)
    end
  end

  let(:options) { {} }
  let(:app) { ->(_env) { [200, {}, ["OK"]] } }
  let(:request) {
    instance_double(Rack::Request, params: {}, cookies: {}, env: {})
  }

  before { OmniAuth.config.test_mode = true }

  describe "クライアントオプション" do
    it "設定値が正しいこと" do
      aggregate_failures do
        expect(strategy.options.name).to eq("line")
        expect(strategy.options.client_options.site).to eq("https://api.line.me")
        expect(strategy.options.client_options.authorize_url).to eq("https://access.line.me/oauth2/v2.1/authorize")
        expect(strategy.options.client_options.token_url).to eq("/oauth2/v2.1/token")
      end
    end
  end

  describe "#uid" do
    let!(:options) { { scope: "profile" } }

    before { stub_access_token }

    it "uid を返すこと" do
      expect(strategy.uid).to eq(raw_info_hash["userId"])
    end
  end

  describe "#info" do
    shared_examples "profile 情報が含まれる" do
      it "name を返すこと" do
        expect(strategy.info[:name]).to eq(raw_info_hash["displayName"])
      end

      it "image を返すこと" do
        expect(strategy.info[:image]).to eq(raw_info_hash["pictureUrl"])
      end
    end

    context "スコープに email が含まれるとき" do
      let!(:options) { { scope: "profile openid email" } }

      before do
        jwt = generate_jwt(email: "test@example.com", sub: "123456")
        stub_access_token(id_token: jwt)
      end

      include_examples "profile 情報が含まれる"

      it "email を返すこと" do
        expect(strategy.info[:email]).to eq(raw_info_hash["email"])
      end

      it "ID トークンの email を raw_info に追加すること" do
        expect(strategy.raw_info["email"]).to eq(raw_info_hash["email"])
      end

      it "ID トークンの sub を raw_info に追加すること" do
        expect(strategy.raw_info["sub"]).to eq("123456")
      end
    end

    context "スコープに email が含まれないとき" do
      let!(:options) { { scope: "profile" } }
      before { stub_access_token }

      include_examples "profile 情報が含まれる"

      it "email は nil を返すこと" do
        expect(strategy.info[:email]).to be_nil
      end

      it "ID トークンの情報で raw_info を変更しないこと" do
        expect(strategy.raw_info[:email]).to be_nil
        expect(strategy.raw_info[:sub]).to be_nil
      end
    end

    context "ID トークンはあるが email を含まないとき" do
      let!(:options) { { scope: "profile openid email" } }

      before do
        jwt = generate_jwt(name: "Test User", sub: "123456")
        stub_access_token(id_token: jwt)
      end

      it "raw_info の既存メールを上書きしないこと" do
        expect(strategy.raw_info["email"]).to eq(raw_info_hash["email"])
      end

      it "ID トークンの sub を raw_info に追加すること" do
        expect(strategy.raw_info["sub"]).to eq("123456")
      end
    end

    context "ID トークンが無効なとき" do
      let!(:options) { { scope: "profile openid email" } }

      before do
        stub_access_token(id_token: "invalid.jwt.token")
        allow(JWT).to receive(:decode).and_raise(JWT::DecodeError)
      end

      it "ID トークンのデコードに失敗しても基本情報を返すこと" do
        aggregate_failures do
          expect(strategy.info[:name]).to eq(raw_info_hash["displayName"])
          expect(strategy.info[:image]).to eq(raw_info_hash["pictureUrl"])
        end
      end

      it "JWT デコードエラーを適切に処理すること" do
        aggregate_failures do
          expect { strategy.info }.not_to raise_error
          expect(strategy.info[:email]).to be_nil
        end
      end
    end
  end

  describe "#extra" do
    let!(:options) { { scope: "profile" } }

    before { stub_access_token }

    it "raw_info を含むこと" do
      expect(strategy.extra).to eq(raw_info: raw_info_hash)
    end
  end

  describe "#client" do
    it "OAuth2::Client を正しい引数で初期化すること" do
      client_double = instance_double(OAuth2::Client)
      expected_opts = {
        site: "https://api.line.me",
        authorize_url: "https://access.line.me/oauth2/v2.1/authorize",
        token_url: "/oauth2/v2.1/token",
      }

      allow(OAuth2::Client).to receive(:new).and_return(client_double)

      result = strategy.client

      aggregate_failures do
        expect(OAuth2::Client).to have_received(:new).with("channel_id", "secret", expected_opts)
        expect(result).to be(client_double)
      end
    end
  end

  describe "#callback_phase" do
    before do
      allow_any_instance_of(OmniAuth::Strategy).to receive(:fail!) do |_stg, message_key, _ex|
        throw :warden, { message: message_key }
      end
    end

    context "認証コードがあるとき" do
      context "Rack 経由のコールバック" do
        before { stub_access_token }

        it "200 を返すこと" do
          env = {
            "rack.session" => {},
            "QUERY_STRING" => "code=valid_code",
            "rack.input" => StringIO.new,
            "omniauth.strategy" => nil,
            "REQUEST_METHOD" => "GET",
            "PATH_INFO" => "/auth/line/callback",
          }

          status, _headers, _body = strategy.call(env)
          expect(status).to eq(200)
        end
      end

      context "親の callback_phase を呼ぶ分岐" do
        before { allow(request).to receive_messages(params: { "code" => "valid" }, env: {}) }

        it "親クラスの callback_phase を呼び出すこと" do
          allow_any_instance_of(OmniAuth::Strategies::OAuth2).
            to receive(:callback_phase).
                 and_return(:parent_called)

          expect(strategy.callback_phase).to eq(:parent_called)
        end
      end
    end

    context "認証コードがないとき" do
      before { allow(request).to receive_messages(params: {}, env: {}) }

      it "authorization_code_missing を返すこと" do
        result = catch(:warden) { strategy.callback_phase }
        expect(result[:message]).to eq("authorization_code_missing")
      end
    end
  end

  describe "#authorize_params" do
    it "super の値を維持しつつ nonce を付与すること" do
      allow(SecureRandom).to receive(:uuid).and_return("fixed-uuid")

      allow_any_instance_of(OmniAuth::Strategies::OAuth2).
        to receive(:authorize_params).
             and_return({ scope: "profile" })

      expect(strategy.send(:authorize_params)).to include(scope: "profile", nonce: "fixed-uuid")
    end
  end
end
