require "rails_helper"

RSpec.describe Station, type: :model do
  let(:operator) { create(:operator, alias_name: "テスト運営会社") }

  let(:ueno) { create(:station, **StationTestData::STATIONS[:ueno], operator: operator) }
  let(:kaminoge) { create(:station, **StationTestData::STATIONS[:kaminoge], operator: operator) }

  def starts_with_search_term?(station, term)
    station.name.start_with?(term) ||
      station.name_hiragana.start_with?(term) ||
      station.name_romaji.start_with?(term)
  end

  describe "associations" do
    it { is_expected.to belong_to(:operator) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:name_hiragana) }
    it { is_expected.to validate_presence_of(:name_romaji) }
    it { is_expected.to validate_presence_of(:latitude) }
    it { is_expected.to validate_presence_of(:longitude) }
    it { is_expected.to validate_presence_of(:group_code) }
    it { is_expected.to validate_presence_of(:uuid) }

    describe "ユニーク制約" do
      subject { build(:station) }

      before  { create(:station) }

      it { is_expected.to validate_uniqueness_of(:name).scoped_to(:group_code).case_insensitive }
      it { is_expected.to validate_uniqueness_of(:uuid).ignoring_case_sensitivity }
    end
  end

  describe "factory" do
    it "有効なファクトリを持つこと" do
      expect(build(:station)).to be_valid
    end

    it "各属性を持つ駅を作成できること" do
      station = create(:station)

      aggregate_failures do
        expect(station.name).to be_present
        expect(station.name_hiragana).to be_present
        expect(station.name_romaji).to be_present
        expect(station.latitude).to be_present
        expect(station.longitude).to be_present
      end
    end

    it "指定した属性で駅を作成できること" do
      test_data = {
        name: "テスト駅",
        name_hiragana: "てすとえき",
        name_romaji: "tesutoeki",
        latitude: 12.34567,
        longitude: 89.12345,
      }
      station = create(:station, **test_data)

      aggregate_failures do
        test_data.each {|attr, value| expect(station.public_send(attr)).to eq(value) }
      end
    end
  end

  describe "駅名検索" do
    def create_station_list
      ueno
      kaminoge
    end

    context "漢字で検索する場合" do
      before { create_station_list }

      it "条件に合致する駅を全て返すこと" do
        results = Station.search_by_name("上野")

        aggregate_failures do
          expect(results).not_to be_empty
          results.each {|st| expect(starts_with_search_term?(st, "上野")).to be true }
          expect(results.map(&:name)).to include("上野", "上野毛")
        end
      end
    end

    context "ひらがなで検索する場合" do
      before { ueno }

      it "条件に合致する駅を全て返すこと" do
        results = Station.search_by_name("うえの")

        aggregate_failures do
          expect(results).not_to be_empty
          results.each {|st| expect(starts_with_search_term?(st, "うえの")).to be true }
        end
      end
    end

    context "ローマ字で検索する場合" do
      before { ueno }

      it "条件に合致する駅を全て返すこと" do
        results = Station.search_by_name("ueno")

        aggregate_failures do
          expect(results).not_to be_empty
          results.each {|st| expect(starts_with_search_term?(st, "ueno")).to be true }
        end
      end
    end

    context "存在しない駅名で検索する場合" do
      it "空の結果を返すこと" do
        results = Station.search_by_name("存在しない駅")
        expect(results).to be_empty
      end
    end

    context "検索結果のソート順" do
      before { create_station_list }

      it "完全一致を優先し、次に名前の長さで並べること" do
        results = Station.search_by_name("上野")
        expect(results.map(&:name)).to eq(%w[上野 上野毛])
      end
    end
  end

  describe "検索時の表示名" do
    it "駅名と運営会社名を返すこと" do
      station = create(
        :station,
        name: "テスト駅",
        name_hiragana: "てすとえき",
        name_romaji: "tesutoseki",
        latitude: 123.45678,
        longitude: 98.76543,
        operator: operator,
      )

      expect(station.display_name).to eq("テスト駅（テスト運営会社）")
    end
  end
end
