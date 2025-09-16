require "rails_helper"

RSpec.describe "Api::V1::User::ConfirmationsController", type: :request do
  describe "PATCH /api/v1/user/confirmations" do
    let!(:path) { api_v1_user_confirmations_path }

    context "確認トークンが有効で、未確認のとき" do
      let!(:user_auth) { create(:user_auth, confirmed_at: nil, confirmation_token: "token-123") }

      it "200 と確認完了メッセージを返し、confirmed_at がセットされる" do
        patch path, params: { confirmation_token: "token-123" }

        expect(response).to have_http_status(:ok)
        expect(json[:message]).to eq(I18n.t("devise.confirmations.confirmed"))
        expect(user_auth.reload.confirmed_at).to be_present
      end
    end

    context "確認トークンに一致するユーザーが存在しないとき" do
      it "404 と未発見メッセージを返す" do
        patch path, params: { confirmation_token: "not-found" }

        expect(response).to have_http_status(:not_found)
        expect(json[:message]).to eq(
          I18n.t("activerecord.models.user") + I18n.t("errors.messages.not_found"),
        )
      end
    end

    context "すでに確認済みのとき" do
      let!(:user_auth) { create(:user_auth, confirmation_token: "already-ok") }

      it "400 と確認済みメッセージを返す" do
        patch path, params: { confirmation_token: "already-ok" }

        expect(response).to have_http_status(:bad_request)
        expect(json[:message]).to eq(
          I18n.t("activerecord.attributes.user_auth.email") + I18n.t("errors.messages.already_confirmed"),
        )
      end
    end
  end
end
