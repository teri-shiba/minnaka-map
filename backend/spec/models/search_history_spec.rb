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
    let!(:matsudo) { create(:station, **StationTestData::STATIONS[:matsudo], operator: operator) }
    let!(:osaka) { create(:station, **StationTestData::STATIONS[:osaka], operator: operator) }

    before do
      create(:search_history_start_station, search_history: search_history, station: matsudo)
      create(:search_history_start_station, search_history: search_history, station: osaka)
    end

    it "関連する駅の名前一覧を返すこと" do
      expect(search_history.station_names).to contain_exactly("松戸", "大阪")
    end
  end
end
