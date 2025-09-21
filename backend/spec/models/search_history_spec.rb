require "rails_helper"

RSpec.describe SearchHistory, type: :model do
  let(:operator) { create(:operator, alias_name: "テスト運営会社") }

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:search_history_start_stations).dependent(:destroy) }
    it { is_expected.to have_many(:favorites).dependent(:destroy) }
    it { is_expected.to have_many(:shared_favorite_lists).dependent(:destroy) }
    it { is_expected.to have_many(:start_stations).through(:search_history_start_stations).source(:station) }
  end

  describe "factory" do
    it "有効なファクトリを持つこと" do
      expect(build(:search_history)).to be_valid
    end
  end

  describe "#station_names" do
    let(:search_history) { create(:search_history) }
    let!(:tokyo) { create(:station, **StationTestData::STATIONS[:tokyo], operator:) }
    let!(:ueno) { create(:station, **StationTestData::STATIONS[:ueno], operator:) }

    before do
      create(:search_history_start_station, search_history:, station: tokyo)
      create(:search_history_start_station, search_history:, station: ueno)
    end

    context "関連が未ロード（includes なし）のとき" do
      it "DB で name 昇順に並べて返すこと" do
        expect(search_history.station_names).to eq(%w[上野 東京])
      end
    end

    context "関連がロード済み（includes 済み）のとき" do
      it "メモリ上の値から name を取得して昇順で返すこと" do
        loaded = SearchHistory.includes(:start_stations).find(search_history.id)
        expect(loaded.association(:start_stations)).to be_loaded
        expect(loaded.station_names).to eq(%w[上野 東京])
      end
    end
  end
end
