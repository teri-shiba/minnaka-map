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

  describe "ファクトリ" do
    context "正常系" do
      it "有効なファクトリを持つこと" do
        expect(build(:station)).to be_valid
      end

      it "駅名が作成できること" do
        station = create(:station)
        expect(station.name).to be_present
        expect(station.name_hiragana).to be_present
        expect(station.name_romaji).to be_present
        expect(station.latitude).to be_present
        expect(station.longitude).to be_present
      end

      it "指定した名前を持つ駅名が作成できること" do
        test_data = {
          name: "テスト駅",
          name_hiragana: "てすとえき",
          name_romaji: "tesutoeki",
          latitude: 12.34567,
          longitude: 89.12345,
        }
        station = create(:station, **test_data)

        test_data.each do |attr, value|
          expect(station.public_send(attr)).to eq(value)
        end
      end
    end
  end

  describe "アソシエーション" do
    it { should belong_to(:operator) }
  end

  describe "バリデーション" do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:latitude) }
    it { should validate_presence_of(:longitude) }
    it { should validate_presence_of(:name_hiragana) }
    it { should validate_presence_of(:name_romaji) }
    it { should validate_presence_of(:group_code) }

    describe "ユニーク制約" do
      subject { create(:station) }

      it { should validate_uniqueness_of(:name).scoped_to(:group_code).case_insensitive }
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
        expect(results).not_to be_empty

        results.each do |station|
          expect(starts_with_search_term?(station, "上野")).to be true
        end

        expect(results.map(&:name)).to include("上野", "上野毛")
      end
    end

    context "ひらがなで検索する場合" do
      before { ueno }

      it "条件に合致する駅を全て返すこと" do
        results = Station.search_by_name("うえの")
        expect(results).not_to be_empty

        results.each do |station|
          expect(starts_with_search_term?(station, "うえの")).to be true
        end
      end
    end

    context "ローマ字で検索する場合" do
      before { ueno }

      it "条件に合致する駅を全て返すこと" do
        results = Station.search_by_name("ueno")
        expect(results).not_to be_empty

        results.each do |station|
          expect(starts_with_search_term?(station, "ueno")).to be true
        end
      end
    end

    context "存在しない駅名で検索する場合" do
      it "空の結果で返すこと" do
        results = Station.search_by_name("存在しない駅")
        expect(results).to be_empty
      end
    end

    context "検索結果のソート順" do
      before { create_station_list }

      it "完全一致を優先し、次に名前の長さで並べること" do
        results = Station.search_by_name("上野")
        expect(results.map(&:name)).to eq(["上野", "上野毛"])
      end
    end
  end

  describe "検索時の表示名" do
    it "駅名と運営会社名を返すこと" do
      station = create(:station,
                       name: "テスト駅",
                       name_hiragana: "てすとえき",
                       name_romaji: "tesutoseki",
                       latitude: 123.45678,
                       longitude: 98.76543,
                       operator: operator)

      expect(station.display_name).to eq("テスト駅（テスト運営会社）")
    end
  end
end
