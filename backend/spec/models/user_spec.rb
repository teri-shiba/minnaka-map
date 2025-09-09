require "rails_helper"

RSpec.describe User, type: :model do
  describe "ファクトリ" do
    context "正常系" do
      it "有効なファクトリを持つこと" do
        expect(build(:user)).to be_valid
      end

      it ":user ファクトリで name を持つユーザーが作成できること" do
        user = create(:user)
        expect(user.name).to be_present
      end

      it "指定した name を持つユーザーが作成できること" do
        user = create(:user, name: "テストユーザー")
        expect(user.name).to eq("テストユーザー")
      end
    end
  end

  describe "関連付け" do
    context "UserAuth モデルとの関連" do
      it { is_expected.to have_many(:user_auths) }
      it { is_expected.to have_many(:user_auths).dependent(:destroy) }
    end
  end

  describe "バリデーション" do
    context "name の必須チェック" do
      it { is_expected.to validate_presence_of(:name) }
    end
  end
end
