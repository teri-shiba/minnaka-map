require "rails_helper"

RSpec.describe Favorite, type: :model do
  describe "関連付け" do
    it { should belong_to(:user) }
    it { should belong_to(:search_history) }
  end

  describe "バリデーション" do
    it { should validate_presence_of(:hotpepper_id) }
  end

  describe "ファクトリ" do
    it "有効なファクトリを持つこと" do
      favorite = build(:favorite)
      expect(favorite).to be_valid
    end

    it "user, search_history, hotpepper_id が正しく設定されること" do
      favorite = create(:favorite)

      expect(favorite.user).to be_present
      expect(favorite.search_history).to be_present
      expect(favorite.hotpepper_id).to be_present
    end
  end

  describe "スコープメソッド" do
    let(:taro) { create(:user, name: "田中太郎") }
    let(:naomi) { create(:user, name: "佐藤直美") }
    let(:taro_search_history) { create(:search_history, user: taro) }
    let(:naomi_search_history) { create(:search_history, user: naomi) }

    let!(:taro_first_favorite) { create(:favorite, user: taro, search_history: taro_search_history) }
    let!(:naomi_favorite) { create(:favorite, user: naomi, search_history: naomi_search_history) }
    let!(:taro_second_favorite) { create(:favorite, user: taro, search_history: taro_search_history) }

    describe ".by_user" do
      it "指定したユーザーのお気に入りのみを返すこと" do
        results = Favorite.by_user(taro)
        expect(results).to include(taro_first_favorite, taro_second_favorite)
        expect(results).not_to include(naomi_favorite)
      end
    end

    describe ".by_search_history" do
      it "指定した検索履歴のお気に入りのみを返すこと" do
        results = Favorite.by_search_history(taro_search_history)
        expect(results).to include(taro_first_favorite, taro_second_favorite)
        expect(results).not_to include(naomi_favorite)
      end
    end

    describe ".recent" do
      it "作成日時の降順で返すこと" do
        results = Favorite.recent
        expect(results.first.created_at).to be >= results.last.created_at
      end
    end
  end
end
