require "rails_helper"

RSpec.describe "Api::V1::Auth::SessionsController", type: :request do
  describe "DELETE /api/v1/auth/sign_out" do
    let!(:user) { create(:user) }
    let!(:user_auth) { create(:user_auth, user:) }
    let!(:auth_headers) { user_auth.create_new_auth_token }

    it "ログアウトが成功すること" do
      delete destroy_api_v1_user_auth_session_path,
             headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(json[:success]).to be(true)
    end

    it "ログアウト後に同じトークンでアクセスできないこと" do
      get api_v1_current_user_path, headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(json.keys).to include(:id, :email, :name, :provider)

      delete destroy_api_v1_user_auth_session_path, headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(json[:success]).to be(true)

      get api_v1_current_user_path, headers: auth_headers
      expect(response).to have_http_status(:unauthorized)
      expect(json[:errors]).to include("ログインもしくはアカウント登録してください。")
    end
  end
end
