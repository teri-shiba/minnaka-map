require "rails_helper"

RSpec.describe "Api::V1::Current::UsersController", type: :request do
  describe "GET /api/v1/current/user" do
    let!(:user_auth) { create(:user_auth) }
    let!(:auth_headers) { user_auth.create_new_auth_token }

    context "ヘッダー情報が正常に送信されたとき" do
      it "200 で id, email, name, provider を返す" do
        get api_v1_current_user_path, headers: auth_headers
        expect(response).to have_http_status(:ok)
        expect(json.keys).to match_array(%i[id email name provider])
      end
    end

    context "ヘッダー情報が空のままリクエストが送信されたとき" do
      it "401 を返す" do
        get api_v1_current_user_path
        expect_unauthorized_json!
      end
    end
  end
end
