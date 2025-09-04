require "rails_helper"

RSpec.describe "Api::V1::Stations", type: :request do
  describe "GET /api/v1/stations" do
    subject(:json) { JSON.parse(response.body, symbolize_names: true) }

    let(:path) { "/api/v1/stations" }
    let(:operator) { create(:operator) }

    def ids_from(res) = res[:stations].map {|h| h[:id] }

    def make_station(name:, code:)
      create(
        :station,
        name: name,
        name_hiragana: "てすと",
        name_romaji: "test",
        latitude: 35.0,
        longitude: 139.70,
        group_code: code,
        operator:,
      )
    end

    context "query が空白／未指定のとき" do
      it "stations: []（未指定）" do
        get path
        expect(response).to have_http_status(:ok)
        expect(json).to eq(stations: [])
      end

      it "空白のみでも station: [] を返す" do
        get path, params: { q: " \n\t" }
        expect(response).to have_http_status(:ok)
        expect(json).to eq(stations: [])
      end
    end

    context "query が与えられたとき" do
      let!(:s_main) { make_station(name: "新宿", code: "G001") }
      let!(:s_west) { make_station(name: "新宿西口", code: "G002") }
      let!(:s_3rd) { make_station(name: "新宿三丁目", code: "G003") }

      it "Station.search_by_name(q).limit(5) の結果を返す" do
        allow(Station).to receive(:search_by_name).
                            with("新宿").
                            and_return(Station.where(id: [s_main.id, s_west.id, s_3rd.id]))

        get path, params: { q: "新宿" }
        expect(response).to have_http_status(:ok)

        expect(json).to have_key(:stations)
        expect(ids_from(json)).to contain_exactly(s_main.id, s_west.id, s_3rd.id)

        station_json = json[:stations].find {|h| h[:id] == s_main.id }
        expect(station_json).to include(:name, :latitude, :longitude)
      end

      it "結果が6件以上でも最大5件に制限される" do
        many = 6.times.map {|i| make_station(name: "テスト駅#{i}", code: "GX%03d" % i) }
        allow(Station).to receive(:search_by_name).with("あ").
                            and_return(Station.where(id: many.map(&:id)))

        get path, params: { q: "あ" }
        expect(json[:stations].size).to eq(5)
      end
    end
  end
end
