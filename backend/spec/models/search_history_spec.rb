require "rails_helper"

RSpec.describe SearchHistory, type: :model do
  let(:operator) { create(:operator, alias_name: "テスト運営会社") }

  describe "関連付け" do
    it { should belong_to(:user) }
    it { should have_many(:search_history_start_stations).dependent(:destroy) }
    it { should have_many(:favorites).dependent(:destroy) }
    it { should have_many(:start_stations).through(:search_history_start_stations).source(:station) }
  end

  describe "ファクトリ" do
    it "有効なファクトリを持つこと" do
      expect(build(:search_history)).to be_valid
    end
  end

  describe "駅名一覧の取得" do
    let(:search_history) { create(:search_history) }
    let!(:tokyo) { create(:station, **StationTestData::STATIONS[:tokyo], operator: operator) }
    let!(:ueno) { create(:station, **StationTestData::STATIONS[:ueno], operator: operator) }

    before do
      create(:search_history_start_station, search_history: search_history, station: tokyo)
      create(:search_history_start_station, search_history: search_history, station: ueno)
    end

    it "関連する駅の名前一覧を返すこと" do
      expect(search_history.station_names).to contain_exactly("東京", "上野")
    end

    it "includes で先読み済みならメモリから取得して昇順で返す" do
      search_history_id = search_history.id
      loaded = SearchHistory.includes(:start_stations).find(search_history_id)
      expect(loaded.association(:start_stations)).to be_loaded
      expect(loaded.station_names).to eq(["上野", "東京"].sort)
    end
  end
end
