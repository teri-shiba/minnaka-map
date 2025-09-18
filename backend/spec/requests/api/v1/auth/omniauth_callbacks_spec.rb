require "rails_helper"

RSpec.describe "Api::V1::Auth::OmniauthCallbacksController", type: :request do
  before do
    allow(DeviseTokenAuth).to receive(:cookie_enabled).and_return(false)
    Rails.application.env_config["devise.mapping"] = Devise.mappings[:user_auth]
  end

  describe "成功フロー（新規／既存）" do
    context "新規作成のとき" do
      it "User と UserAuth を作成して、success に 302 リダイレクト" do
        auth = build_auth(
          uid: "uid-#{SecureRandom.hex(4)}",
          email: "new-#{SecureRandom.hex(6)}@example.com",
          name: "テスト太郎",
        )
        start_omniauth_flow(provider: :google_oauth2, auth_hash: auth)
        expect {
          get omniauth_success_callback_path(:google_oauth2)
        }.to change { User.count }.by(1).
               and change { UserAuth.count }.by(1)

        expect_front_redirect(status: "success")
        expect(session["dta.omniauth.auth"]).to be_nil
      end
    end

    context "既存: provider+uid がすでに存在するとき" do
      let!(:exist) { create(:user_auth, provider: "google_oauth2", uid: "uid-exist", email: "exist@example.com") }

      it "レコードは増加せず success パラメータで 302 リダイレクト" do
        auth = build_auth(uid: exist.uid, email: exist.email, name: "既存ユーザー")
        start_omniauth_flow(provider: :google_oauth2, auth_hash: auth)
        expect {
          get omniauth_success_callback_path(:google_oauth2)
        }.to not_change { User.count }.
               and not_change { UserAuth.count }

        expect_front_redirect(status: "success")
      end
    end
  end

  describe "ガード・分岐" do
    context "登録時のメールアドレスが他認証で使用されているとき (email 既存・ uid 新規)" do
      before { create(:user_auth, email: "duplicate@example.com") }

      it "レコードは増加せず、error パラメータで 302 リダイレクト" do
        auth = build_auth(uid: "uid-new", email: "duplicate@example.com", name: "重複ユーザー")
        start_omniauth_flow(provider: :google_oauth2, auth_hash: auth)
        expect {
          get omniauth_success_callback_path(:google_oauth2)
        }.to not_change { User.count }.
               and not_change { UserAuth.count }

        message = "#{UserAuth.human_attribute_name(:email)}" \
                  "#{I18n.t("activerecord.errors.models.user_auth.attributes.email.taken")}"

        expect_front_redirect(status: "error", message:)
      end
    end
  end

  describe "失敗フロー" do
    context "/api/v1/auth/failure のとき" do
      it "error パラメータで 302 リダイレクト" do
        get api_v1_auth_failure_path
        expect_front_redirect(status: "error")
      end
    end
  end
end
