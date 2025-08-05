require "rails_helper"

RSpec.describe SearchHistoryStartStation, type: :model do
  describe "関連付け" do
    it { should belong_to(:search_history) }
    it { should belong_to(:station) }
  end

  describe "ファクトリ" do
    it "有効なファクトリを持つこと" do
      search_history_start_station = build(:search_history_start_station)
      expect(search_history_start_station).to be_valid
    end

    it "search_history と station が正しく関連づけられること" do
      search_history_start_station = create(:search_history_start_station)

      expect(search_history_start_station.search_history).to be_valid
      expect(search_history_start_station.station).to be_valid
    end
  end
end
