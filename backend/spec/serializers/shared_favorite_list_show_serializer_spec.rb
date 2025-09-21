require "rails_helper"

RSpec.describe SharedFavoriteListShowSerializer, type: :serializer do
  subject(:json) do
    ActiveModelSerializers::SerializableResource.new(
      shared_list,
      serializer: SharedFavoriteListShowSerializer,
    ).as_json
  end

  let(:search_history) { create(:search_history) }
  let(:shared_list) {
    create(
      :shared_favorite_list,
      title: "東京・新宿の真ん中のお店",
      search_history:,
    )
  }
  let!(:favorite_french) {
    create(
      :favorite,
      search_history:,
      hotpepper_id: "HP123",
    )
  }
  let!(:favorite_italian) {
    create(
      :favorite,
      search_history:,
      hotpepper_id: "HP456",
    )
  }

  before do
    allow(search_history).to receive(:station_names).and_return(["東京", "新宿"])
  end

  it "title を返す" do
    expect(json[:title]).to eq("東京・新宿の真ん中のお店")
  end

  it "created_at を ISO8601 で返す" do
    expect(json[:created_at]).to eq(shared_list.created_at.iso8601)
  end

  it "search_history を返す" do
    expect(json[:search_history]).to eq(
      id: search_history.id,
      station_names: ["東京", "新宿"],
    )
  end

  it "favorites を返す" do
    expect(json[:favorites]).to contain_exactly(
      { id: favorite_french.id, hotpepper_id: "HP123" },
      { id: favorite_italian.id, hotpepper_id: "HP456" },
    )
  end
end
