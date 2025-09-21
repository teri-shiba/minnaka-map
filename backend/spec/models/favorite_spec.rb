require "rails_helper"

RSpec.describe Favorite, type: :model do
  include ActiveSupport::Testing::TimeHelpers

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:search_history) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:hotpepper_id) }
  end

  describe "factory" do
    it "有効なファクトリを持つこと" do
      expect(build(:favorite)).to be_valid
    end

    it "user / search_history / hotpepper_id が設定されること" do
      favorite = create(:favorite)

      aggregate_failures do
        expect(favorite.user).to be_present
        expect(favorite.search_history).to be_present
        expect(favorite.hotpepper_id).to be_present
      end
    end
  end

  describe "scopes" do
    let(:taro)  { create(:user, name: "田中太郎") }
    let(:naomi) { create(:user, name: "佐藤直美") }
    let(:taro_search_history)  { create(:search_history, user: taro) }
    let(:naomi_search_history) { create(:search_history, user: naomi) }

    let!(:taro_first_favorite) do
      travel_to(1.hour.ago) { create(:favorite, user: taro, search_history: taro_search_history) }
    end
    let!(:naomi_favorite) do
      travel_to(30.minutes.ago) { create(:favorite, user: naomi, search_history: naomi_search_history) }
    end
    let!(:taro_second_favorite) do
      travel_to(Time.current) { create(:favorite, user: taro, search_history: taro_search_history) }
    end

    describe ".by_user" do
      it "指定したユーザーのお気に入りのみを返すこと" do
        results = Favorite.by_user(taro)
        expect(results).to contain_exactly(taro_first_favorite, taro_second_favorite)
      end
    end

    describe ".by_search_history" do
      it "指定した検索履歴のお気に入りのみを返すこと" do
        results = Favorite.by_search_history(taro_search_history)
        expect(results).to contain_exactly(taro_first_favorite, taro_second_favorite)
      end
    end

    describe ".recent" do
      it "作成日時の降順で返すこと" do
        expect(Favorite.recent).to eq(
          [taro_second_favorite, naomi_favorite, taro_first_favorite],
        )
      end
    end
  end
end
