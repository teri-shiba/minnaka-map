require "rails_helper"

RSpec.describe "Api::V1::Auth::OmniauthCallbacksController", type: :request do
  let(:front_domain) { Settings.front_domain }

  describe "GET /api/v1/auth/google_oauth2/callback" do
    let(:provider) { "google_oauth2" }
    let(:uid) { "123456789" }
    let(:email) { "google@example.com" }
    let(:name) { "Google User" }

    before do
      set_omniauth_mock(provider, uid:, email:, name:)
    end

    context "新規ユーザーのとき" do
      it "User と UserAuth を作成し、リダイレクトすること" do
        expect {
          get "/api/v1/auth/#{provider}/callback"
        }.to change { User.count }.by(1).
               and change { UserAuth.count }.by(1)

        expect(response).to redirect_to("#{front_domain}/?status=success")
      end

      it "作成された User と UserAuth の属性が正しいこと" do
        get "/api/v1/auth/#{provider}/callback"

        created_user = User.last
        created_user_auth = UserAuth.last

        expect(created_user.name).to eq(name)
        expect(created_user_auth.provider).to eq(provider)
        expect(created_user_auth.uid).to eq(uid)
        expect(created_user_auth.email).to eq(email)
        expect(created_user_auth.user).to eq(created_user)
      end
    end

    context "既存ユーザーのとき" do
      let!(:existing_user) { create(:user, name: "Existing User") }
      let!(:existing_user_auth) { create(:user_auth, provider:, uid:, email:, user: existing_user) }

      it "新しいレコードを作成せず、成功ページにリダイレクトすること" do
        expect {
          get "/api/v1/auth/#{provider}/callback"
        }.to not_change { User.count }.and not_change { UserAuth.count }

        expect(response).to redirect_to("#{front_domain}/?status=success")
      end
    end

    context "メールアドレスが既に登録済みのとき" do
      let!(:existing_user) { create(:user) }
      let!(:existing_user_auth) { create(:user_auth, email:, user: existing_user) }

      it "エラーメッセージと共にエラーページにリダイレクトすること" do
        expect {
          get "/api/v1/auth/#{provider}/callback"
        }.to not_change { User.count }.and not_change { UserAuth.count }

        expect(response).to have_http_status(:redirect)

        uri = URI.parse(response.location)
        params = CGI.parse(uri.query)

        expect(params["status"]).to eq(["error"])

        expected_message = "#{UserAuth.human_attribute_name(:email)}" \
                         "#{I18n.t("activerecord.errors.models.user_auth.attributes.email.taken")}"
        expect(params["message"].first).to eq(expected_message)
      end
    end

    context "redirect_to パラメータがあるとき" do
      before do
        set_omniauth_mock(provider, uid:, email:, name:, redirect_to: "/result")
      end

      it "指定されたパスにリダイレクトすること" do
        get "/api/v1/auth/#{provider}/callback"

        expect(response).to redirect_to("#{front_domain}/result?status=success")
      end

      context "クエリパラメータが含まれるとき" do
        before do
          set_omniauth_mock(provider, uid:, email:, name:, redirect_to: "/result?lat=35.00000&lng=139.00000")
        end

        it "クエリパラメータを保持してリダイレクトすること" do
          get "/api/v1/auth/#{provider}/callback"

          expect(response).to redirect_to("#{front_domain}/result?lat=35.00000&lng=139.00000&status=success")
        end
      end
    end
  end

  describe "GET /api/v1/auth/line/callback" do
    let(:provider) { "line" }
    let(:uid) { "987654321" }
    let(:email) { "line@example.com" }
    let(:name) { "LINE User" }

    before do
      set_omniauth_mock(provider, uid:, email:, name:)
    end

    context "新規ユーザーのとき" do
      it "User と UserAuth を作成し、リダイレクトすること" do
        expect {
          get "/api/v1/auth/#{provider}/callback"
        }.to change { User.count }.by(1).and change { UserAuth.count }.by(1)

        expect(response).to redirect_to("#{front_domain}/?status=success")

        created_user_auth = UserAuth.last
        expect(created_user_auth.provider).to eq(provider)
        expect(created_user_auth.uid).to eq(uid)
      end
    end

    context "既存ユーザーのとき" do
      let!(:existing_user) { create(:user, name: "Existing User") }
      let!(:existing_user_auth) { create(:user_auth, provider:, uid:, email:, user: existing_user) }

      it "新しいレコードを作成せず、成功ページにリダイレクトすること" do
        expect {
          get "/api/v1/auth/#{provider}/callback"
        }.to not_change { User.count }.and not_change { UserAuth.count }

        expect(response).to redirect_to("#{front_domain}/?status=success")
      end
    end

    context "メールアドレスが既に登録済みのとき" do
      let!(:existing_user) { create(:user) }
      let!(:existing_user_auth) { create(:user_auth, email:, user: existing_user) }

      it "エラーメッセージと共にエラーページにリダイレクトすること" do
        expect {
          get "/api/v1/auth/#{provider}/callback"
        }.to not_change { User.count }.and not_change { UserAuth.count }

        expect(response).to have_http_status(:redirect)

        uri = URI.parse(response.location)
        params = CGI.parse(uri.query)

        expect(params["status"]).to eq(["error"])

        expected_message = "#{UserAuth.human_attribute_name(:email)}" \
                         "#{I18n.t("activerecord.errors.models.user_auth.attributes.email.taken")}"
        expect(params["message"].first).to eq(expected_message)
      end
    end
  end

  describe "GET /api/v1/auth/failure" do
    it "エラーページにリダイレクトすること" do
      get "/api/v1/auth/failure"

      expect(response).to redirect_to("#{front_domain}/?status=error")
    end

    context "redirect_to パラメータがあるとき" do
      before do
        allow_any_instance_of(Api::V1::Auth::OmniauthCallbacksController).
          to receive(:session).
               and_return({ "omniauth.redirect_to" => "/result" })
      end

      it "指定されたパスにリダイレクトすること" do
        get "/api/v1/auth/failure"

        expect(response).to redirect_to("#{front_domain}/result?status=error")
      end
    end
  end
end
