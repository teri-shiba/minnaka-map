require "rails_helper"

RSpec.describe SearchHistoryStartStation, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:search_history) }
    it { is_expected.to belong_to(:station) }
  end

  describe "validations" do
    describe "ユニーク制約" do
      subject { create(:search_history_start_station) }

      it { is_expected.to validate_uniqueness_of(:station_id).scoped_to(:search_history_id) }
    end

    it "同じ search_history で同じ station は登録できないこと" do
      search_history = create(:search_history)
      station = create(:station)

      create(:search_history_start_station, search_history:, station:)
      dup = build(:search_history_start_station, search_history:, station:)

      expect(dup).to be_invalid
      expect(dup.errors[:station_id]).to be_present
    end

    it "search_history が異なれば同じ station を登録できること" do
      station = create(:station)
      fist_history = create(:search_history)
      second_history = create(:search_history)

      create(:search_history_start_station, search_history: fist_history, station:)
      another = create(:search_history_start_station, search_history: second_history, station:)

      expect(another).to be_valid
    end
  end

  describe "factory" do
    it "有効なファクトリを持つこと" do
      record = build(:search_history_start_station)
      expect(record).to be_valid
    end

    it "search_history と station が正しく関連づけられること" do
      record = create(:search_history_start_station)

      aggregate_failures do
        expect(record.search_history).to be_present
        expect(record.station).to be_present
        expect(record.search_history).to be_valid
        expect(record.station).to be_valid
      end
    end
  end
end
