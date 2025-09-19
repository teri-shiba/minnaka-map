require "rails_helper"

RSpec.describe "Api::V1::ApiKeysController", type: :request do
  let!(:valid_internal_token) { "valid-internal-token-123" }
  let!(:internal_token_headers) { { "X-Internal-Token" => valid_internal_token } }

  before do
    allow(Rails.application.credentials).to receive_messages(internal_api_token: valid_internal_token, dig: nil)
  end

  describe "GET /api/v1/api_keys/:service" do
    context "認証成功" do
      context "サポートされてるサービス" do
        let(:hotpepper_api_key) { "hotpepper-api-key-123" }
        let(:maptiler_api_key) { "maptiler-api-key-123" }
        let(:googlemaps_api_key) { "googlemaps-api-key-123" }

        before do
          credentials = Rails.application.credentials
          allow(credentials).to receive(:dig).with(:hotpepper, :api_key).and_return(hotpepper_api_key)
          allow(credentials).to receive(:dig).with(:map_tiler, :api_key).and_return(maptiler_api_key)
          allow(credentials).to receive(:dig).with(:google_maps, :api_key).and_return(googlemaps_api_key)
        end

        it "hotpepper サービスのとき、hotpepper のキーを返す" do
          get api_v1_api_key_path(service: "hotpepper"),
              headers: internal_token_headers

          expect_status_ok!
          expect(data[:api_key]).to eq hotpepper_api_key
        end

        it "maptiler サービスのとき、maptiler のキーを返す" do
          get api_v1_api_key_path(service: "maptiler"),
              headers: internal_token_headers

          expect_status_ok!
          expect(data[:api_key]).to eq maptiler_api_key
        end

        it "googlemaps サービスのとき、googlemaps のキーを返す" do
          get api_v1_api_key_path(service: "googlemaps"),
              headers: internal_token_headers

          expect_status_ok!
          expect(data[:api_key]).to eq googlemaps_api_key
        end

        it "大文字・前後空白でも正しく解決する" do
          get api_v1_api_key_path(service: "  HOTPEPPER  "),
              headers: internal_token_headers

          expect_status_ok!
        end
      end

      context "サポートされていないサービス" do
        it "400 を返す" do
          get api_v1_api_key_path(service: "unsupported_service"),
              headers: internal_token_headers

          expect_bad_request_json!(message: "サポートされていないサービスです")
        end
      end

      context "サービス名が空文字のとき" do
        it "404 を返す" do
          get api_v1_api_key_path(service: ""),
              headers: internal_token_headers

          expect(response).to have_http_status(:not_found)
          expect(response.content_type).to include("text/html")
        end
      end
    end

    context "認証失敗" do
      before do
        allow(Rails.logger).to receive(:warn)
      end

      context "X-Internal-Token ヘッダーが存在しないとき" do
        it "403 を返し、警告ログが出力される" do
          get api_v1_api_key_path(service: "hotpepper")

          expect_forbidden_json!(message: "アクセスが拒否されました")
          expect(Rails.logger).to have_received(:warn).with(/内部APIトークン検証失敗/)
        end
      end

      context "X-Internal-Token が間違っているとき" do
        let!(:invalid_headers) { { "X-Internal-Token" => "invalid-token" } }

        it "403 を返す" do
          get api_v1_api_key_path(service: "hotpepper"),
              headers: invalid_headers

          expect_forbidden_json!(message: "アクセスが拒否されました")
          expect(Rails.logger).to have_received(:warn).with(/内部APIトークン検証失敗/)
        end
      end

      context "X-Internal-Token が空文字のとき" do
        let!(:empty_headers) { { "X-Internal-Token" => "" } }

        it "403 を返す" do
          get api_v1_api_key_path(service: "hotpepper"),
              headers: empty_headers

          expect_forbidden_json!(message: "アクセスが拒否されました")
          expect(Rails.logger).to have_received(:warn).with(/内部APIトークン検証失敗/)
        end
      end
    end
  end
end
