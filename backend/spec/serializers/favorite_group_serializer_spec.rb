require "rails_helper"

RSpec.describe FavoriteGroupSerializer, type: :serializer do
  describe ".call" do
    let!(:search_history) do
      instance_double(SearchHistory, id: 42, station_names: %w[東京 神田])
    end

    let!(:first_fav)  { instance_double(Favorite, id: 101) }
    let!(:second_fav) { instance_double(Favorite, id: 102) }

    it "search_history と favorites を期待する構造で返す" do
      first_fav_json = { id: 101, any: "payload1" }
      second_fav_json = { id: 102, any: "payload2" }

      allow(FavoriteSerializer).to receive(:call).with(first_fav).ordered.and_return(first_fav_json)
      allow(FavoriteSerializer).to receive(:call).with(second_fav).ordered.and_return(second_fav_json)

      result = FavoriteGroupSerializer.call(search_history, [first_fav, second_fav]).deep_symbolize_keys

      expect(result).to eq(
        search_history: { id: 42, station_names: %w[東京 神田] },
        favorites: [first_fav_json, second_fav_json],
      )

      expect(FavoriteSerializer).to have_received(:call).with(first_fav).ordered
      expect(FavoriteSerializer).to have_received(:call).with(second_fav).ordered
    end

    it "favorites が空配列のときも空で返す" do
      allow(FavoriteSerializer).to receive(:call)

      result = FavoriteGroupSerializer.call(search_history, []).deep_symbolize_keys

      expect(result).to eq(
        search_history: { id: 42, station_names: %w[東京 神田] },
        favorites: [],
      )

      expect(FavoriteSerializer).not_to have_received(:call)
    end
  end
end
