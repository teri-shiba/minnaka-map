require "rails_helper"

RSpec.describe "Api::V1::StationsController", type: :request do
  describe "GET /api/v1/stations" do
    context "クエリが空白もしくは未指定のとき" do
      it "stations: []（未指定）を返す" do
        get api_v1_stations_path
        expect(response).to have_http_status(:ok)
        expect(json).to eq(stations: [])
      end

      it "空白のみでも stations: [] を返す" do
        get api_v1_stations_path, params: { q: " \n\t" }
        expect(response).to have_http_status(:ok)
        expect(json).to eq(stations: [])
      end
    end

    context "クエリが与えられたとき" do
      let!(:s_main) { create(:station, name: "新宿") }
      let!(:s_west) { create(:station, name: "新宿西口") }
      let!(:s_3rd)  { create(:station, name: "新宿三丁目") }

      it "Station.search_by_name(q).limit(5) の結果を返す" do
        allow(Station).to receive(:search_by_name).
                            with("新宿").
                            and_return(Station.where(id: [s_main.id, s_west.id, s_3rd.id]))

        get api_v1_stations_path, params: { q: "新宿" }
        expect(response).to have_http_status(:ok)

        expect(json).to have_key(:stations)
        expect(json[:stations].map {|st| st[:id] }).
          to contain_exactly(s_main.id, s_west.id, s_3rd.id)
        expect(json[:stations]).to all(include(:id, :name))
      end

      it "一致結果が 0 件なら stations: [] を返す" do
        allow(Station).to receive(:search_by_name).with("存在しない").
                            and_return(Station.none)

        get api_v1_stations_path, params: { q: "存在しない" }
        expect(response).to have_http_status(:ok)
        expect(json).to eq(stations: [])
      end

      it "結果が 6 件以上でも最大 5 件に制限される" do
        over_limit_stations = create_list(:station, 6)
        allow(Station).to receive(:search_by_name).with("あ").
                            and_return(Station.where(id: over_limit_stations.map(&:id)))

        get api_v1_stations_path, params: { q: "あ" }
        expect(response).to have_http_status(:ok)
        expect(json[:stations].size).to eq(5)
      end
    end
  end
end
