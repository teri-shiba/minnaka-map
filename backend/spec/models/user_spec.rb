require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    it { is_expected.to have_many(:user_auths).dependent(:destroy) }
    it { is_expected.to have_many(:search_histories).dependent(:destroy) }
    it { is_expected.to have_many(:favorites).dependent(:destroy) }
    it { is_expected.to have_many(:shared_favorite_lists).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
  end

  describe "factory" do
    let!(:user) { create(:user) }

    it "デフォルト属性で作成したユーザーが有効であること" do
      aggregate_failures do
        expect(user).to be_valid
        expect(user.name).to be_present
      end
    end

    it "指定した名前でユーザーが作成できること" do
      user = create(:user, name: "Test User")
      expect(user.name).to eq("Test User")
    end
  end
end
