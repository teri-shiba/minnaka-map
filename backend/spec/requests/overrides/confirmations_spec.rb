require "rails_helper"

RSpec.describe "Overrides::ConfirmationsController", type: :request do
  let(:redirect_url) { "http://localhost:8000/login" }

  describe "GET /api/v1/auth/confirmation" do
    context "有効なトークンで未確認ユーザーを確認するとき" do
      let(:user_auth) { create(:user_auth, :unconfirmed) }

      it "ユーザーを確認済みにし、success=email_confirmed で redirect_url にリダイレクトする" do
        get "/api/v1/auth/confirmation", params: {
          confirmation_token: user_auth.confirmation_token,
          redirect_url:,
        }

        expect(response).to have_http_status(:found)
        uri = URI.parse(response.location)
        expect(uri).to have_attributes(scheme: "http", host: "localhost", port: 8000)
        expect(uri.path).to eq("/login")

        query = Rack::Utils.parse_query(uri.query)
        expect(query["success"]).to eq("email_confirmed")

        expect(user_auth.reload).to be_confirmed
      end
    end

    context "すでに確認済みのトークンでアクセスしたとき" do
      let(:user_auth) { create(:user_auth, :confirmed) }

      it "confirmed_at は変わらず、error=already_confirmed でリダイレクトする" do
        original_confirmed_at = user_auth.confirmed_at

        get "/api/v1/auth/confirmation", params: {
          confirmation_token: user_auth.confirmation_token,
          redirect_url:,
        }

        expect(response).to have_http_status(:found)
        uri = URI.parse(response.location)
        query = Rack::Utils.parse_query(uri.query)

        expect(uri.path).to eq("/login")
        expect(query["error"]).to eq("already_confirmed")

        expect(user_auth.reload.confirmed_at).to eq(original_confirmed_at)
      end
    end

    context "不正なトークンでアクセスしたとき" do
      it "ユーザー状態を変更せず、error=request_failed でリダイレクトする" do
        get "/api/v1/auth/confirmation", params: {
          confirmation_token: "invalid",
          redirect_url:,
        }

        expect(response).to have_http_status(:found)
        uri = URI.parse(response.location)
        query = Rack::Utils.parse_query(uri.query)

        expect(uri.path).to eq("/login")
        expect(query["error"]).to eq("request_failed")
      end
    end
  end
end
