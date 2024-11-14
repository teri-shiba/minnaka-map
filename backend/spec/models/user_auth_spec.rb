require "rails_helper"

RSpec.describe UserAuth, type: :model do
  context "factoryのデフォルト設定に従った場合" do
    let(:user_auth) { create(:user_auth) }

    it "認証済みのuser_authレコーダーを正常に新規作成できる" do
      expect(user_auth).to be_valid
      expect(user_auth).to be_confirmed
    end
  end
end
