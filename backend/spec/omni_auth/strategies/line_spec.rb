require "rails_helper"
require "omniauth"
require "rack"
require "oauth2"
require_relative "../../../lib/omniauth/strategies/line.rb"

describe OmniAuth::Strategies::Line, type: :strategy do
  subject do
    OmniAuth::Strategies::Line.new(app, "channel_id", "secret", options).tap do |strategy|
      allow(strategy).to receive(:request).and_return(request)
    end
  end

  let(:options) { defined?(@option) ? @option : {} }
  let(:app) { ->(_env) { [200, {}, ["OK"]] } }
  let(:request) {
    instance_double(Rack::Request, params: {}, cookies: {}, env: {})
  }

  before { OmniAuth.config.test_mode = true }

  describe "クライアントオプション" do
    it "正しい名前であること" do
      expect(subject.options.name).to eq("line")
    end

    it "正しいサイトであること" do
      expect(subject.options.client_options.site).to eq("https://api.line.me")
    end

    it "正しい認証URLであること" do
      expect(subject.options.client_options.authorize_url).to eq("https://access.line.me/oauth2/v2.1/authorize")
    end

    it "正しいトークンURLであること" do
      expect(subject.options.client_options.token_url).to eq("/oauth2/v2.1/token")
    end
  end

  describe "コールバックフェーズ" do
    before do
      allow_any_instance_of(OmniAuth::Strategy).to receive(:fail!) do |_strategy, message_key, _exception|
        throw :warden, { message: message_key }
      end
    end

    context "認証コードがないとき" do
      before do
        allow(request).to receive_messages(params: {}, env: {})
      end

      it "適切なエラーでファイルすること" do
        result = catch(:warden) do
          subject.callback_phase
        end
        expect(result[:message]).to eq("authorization_code_missing")
      end
    end

    context "認証コードがあるとき" do
      let(:env) {
        {
          "rack.session" => {},
          "QUERY_STRING" => "code=valid_code",
          "rack.input" => StringIO.new,
          "omniauth.strategy" => nil,
          "REQUEST_METHOD" => "GET",
          "PATH_INFO" => "/auth/line/callback",
        }
      }

      before { stub_access_token }

      it "正常に完了すること" do
        status, _headers, _body = subject.call(env)
        expect(status).to eq(200)
      end
    end
  end

  describe "uid" do
    before do
      @option = { scope: "profile" }
      stub_access_token
    end

    it "uid がレスポンスで返ること" do
      expect(subject.uid).to eq(raw_info_hash["userId"])
    end
  end

  describe "info" do
    shared_examples "profile 情報が含まれる" do
      it { expect(subject.info[:name]).to eq(raw_info_hash["displayName"]) }
      it { expect(subject.info[:image]).to eq(raw_info_hash["pictureUrl"]) }
    end

    context "スコープに email が含まれるとき" do
      before do
        @option = { scope: "profile openid email" }
        jwt = generate_jwt(email: "test@example.com", sub: "123456")
        stub_access_token(id_token: jwt)
      end

      include_examples "profile 情報が含まれる"

      it "email がレスポンスで返ること" do
        expect(subject.info[:email]).to eq(raw_info_hash["email"])
      end

      it "ID トークンの email を raw_info に追加する" do
        expect(subject.raw_info["email"]).to eq(raw_info_hash["email"])
      end

      it "ID トークンの sub を raw_info に追加する" do
        expect(subject.raw_info["sub"]).to eq("123456")
      end
    end

    context "スコープに email が含まれないとき" do
      before do
        @option = { scope: "profile" }
        stub_access_token
      end

      include_examples "profile 情報が含まれる"

      it "email は nil がレスポンスで返ること" do
        expect(subject.info[:email]).to be_nil
      end

      it "ID トークンデータで raw_info を変更しないこと" do
        expect(subject.raw_info[:email]).to be_nil
        expect(subject.raw_info[:sub]).to be_nil
      end
    end

    context "ID トークンはあるが email を含まないとき" do
      before do
        @option = { scope: "profile openid email" }
        jwt = generate_jwt(name: "Test User", sub: "123456")
        stub_access_token(id_token: jwt)
      end

      it "raw_info の既存メールを上書きしないこと" do
        expect(subject.raw_info["email"]).to eq(raw_info_hash["email"])
      end

      it "ID トークンの sub を raw_info に追加すること" do
        expect(subject.raw_info["sub"]).to eq("123456")
      end
    end

    context "ID トークンが無効なとき" do
      before do
        @option = { scope: "profile openid email" }
        stub_access_token(id_token: "invalid.jwt.token")
        allow(JWT).to receive(:decode).and_raise(JWT::DecodeError)
      end

      it "ID token が失敗しても基本情報を返すこと" do
        expect(subject.info[:name]).to eq(raw_info_hash["displayName"])
        expect(subject.info[:image]).to eq(raw_info_hash["pictureUrl"])
      end

      it "JWT 複合エラーを適切に処理すること" do
        expect { subject.info }.not_to raise_error
        expect(subject.info[:email]).to be_nil
      end
    end
  end
end
