require "rails_helper"

RSpec.describe "Api::V1::Overrides::RegistrationsController", type: :request do
  describe "POST /api/v1/auth" do
    let(:user_name) { Faker::Name.name }
    let(:user_email) { Faker::Internet.unique.email }
    let(:user_password) { Faker::Internet.password(min_length: 8) }

    let(:valid_params) do
      {
        name: user_name,
        email: user_email,
        password: user_password,
        password_confirmation: user_password,
        confirm_success_url: "http://example.com/confirmed",
      }
    end

    context "正常なパラメータを送信した場合" do
      it "200 を返す" do
        post api_v1_user_auth_registration_path,
             params: valid_params, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "User が 1 件作成される" do
        expect {
          post api_v1_user_auth_registration_path, params: valid_params, as: :json
        }.to change { User.count }.by(1)
      end

      it "UserAuth が 1 件作成される" do
        expect {
          post api_v1_user_auth_registration_path, params: valid_params, as: :json
        }.to change { UserAuth.count }.by(1)
      end

      it "作成された User の name が一致する" do
        post api_v1_user_auth_registration_path,
             params: valid_params, as: :json
        expect(User.last.name).to eq(user_name)
      end

      it "作成された UserAuth の email が小文字で保存される" do
        post api_v1_user_auth_registration_path,
             params: valid_params, as: :json
        expect(UserAuth.last.email).to eq(user_email.downcase)
      end

      it "UserAuth は User に紐づく" do
        post api_v1_user_auth_registration_path,
             params: valid_params, as: :json
        expect(UserAuth.last.user).to eq(User.last)
      end

      it "レスポンスに登録済み email が含まれる" do
        post api_v1_user_auth_registration_path,
             params: valid_params, as: :json
        expect(json[:status]).to eq("success")
        expect(data[:email]).to eq(user_email.downcase)
      end
    end

    context "name が欠落している場合" do
      it "422 を返す" do
        post api_v1_user_auth_registration_path,
             params: valid_params.except(:name),
             as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "User / UserAuth は作成されない" do
        expect {
          post api_v1_user_auth_registration_path, params: valid_params.except(:name), as: :json
        }.to not_change { User.count }.
               and not_change { UserAuth.count }
      end
    end

    context "email が不正な形式の場合" do
      it "422 を返す" do
        post api_v1_user_auth_registration_path,
             params: valid_params.merge(email: "invalid-email"),
             as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "既に登録済みのメールアドレスで登録しようとした場合" do
      before do
        create(:user_auth, email: user_email)
      end

      it "422 を返す" do
        post api_v1_user_auth_registration_path,
             params: valid_params, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "User / UserAuth は作成されない" do
        expect {
          post api_v1_user_auth_registration_path,
               params: valid_params, as: :json
        }.to not_change { User.count }.
               and not_change { UserAuth.count }
      end

      it "duplicate_email エラーを返す" do
        post api_v1_user_auth_registration_path,
             params: valid_params, as: :json
        expect(json[:error]).to eq("duplicate_email")
      end
    end
  end
end
