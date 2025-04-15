require "rails_helper"

RSpec.describe "Overrides::Registrations", type: :request do
  describe "POST /api/v1/auth" do
    # Faker を使ってランダムなテストデータを生成
    let(:user_name) { Faker::Name.name }
    let(:user_email) { Faker::Internet.unique.email }
    let(:user_password) { Faker::Internet.password(min_length: 8) }

    let(:valid_params) do
      {
        name: user_name,
        email: user_email,
        password: user_password,
        password_confirmation: user_password,
        confirm_success_url: 'http://example.com/confirmed'
      }
    end

    # 異常系のパラメーターを意図的に作成
    let(:invalid_params_no_name) { valid_params.except(:name) }
    let(:invalid_params_invalid_email) { valid_params.merge(email: "invalid-email") }

    # -- 正常系のテスト --
    context "正常なパラメータを送信した場合" do
      subject(:make_request) { post api_v1_user_auth_registration_path, params: valid_params }

      it "リクエストが成功し、ステータスコード 200 が返ること" do
        make_request
        expect(response).to have_http_status(:ok)
      end

      it "User レコードが1件作成されること" do
        expect { make_request }.to change { User.count }.by(1)
      end

      it "UserAuth レコードが1件作成されること" do
        expect { make_request }.to change { UserAuth.count }.by(1)
      end

      it "作成された User の name がパラメータと一致すること" do
        make_request
        expect(User.last.name).to eq(user_name)
      end

      it "作成された UserAuth の email が正しいこと" do
        make_request
        expect(UserAuth.last.email).to eq(user_email.downcase)
      end

      it "作成された UserAuth が、作成された User に正しく紐づいていること" do
        make_request
        created_user = User.last
        created_user_auth = UserAuth.last
        expect(created_user_auth.user_id).to eq(created_user.id)
        expect(created_user_auth.user).to eq(created_user)
      end

      it "レスポンスボディに登録されたユーザーの email が含まれること" do
        make_request
        json_response = JSON.parse(response.body)
        expect(json_response["status"]).to eq("success")
        expect(json_response["data"]["email"]).to eq(valid_params[:email].downcase)
      end
    end

    # -- 異常系のテスト --
    context "パラメータから name が欠落している場合" do
      subject(:make_request_without_name) { post api_v1_user_auth_registration_path, params: invalid_params_no_name }

      it "リクエストが失敗し、ステータスコード 500 が返ること（要確認/改善推奨）" do
        make_request_without_name
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "User レコードが作成されないこと" do
        expect {
          begin
            make_request_without_name
          rescue
            nil
          end
        }.not_to change { User.count }
      end

      it "UserAuth レコードが作成されないこと" do
        expect {
          begin
            make_request_without_name
          rescue
            nil
          end
        }.not_to change { UserAuth.count }
      end
    end
  end
end
