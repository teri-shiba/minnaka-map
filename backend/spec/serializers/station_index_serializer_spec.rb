require "rails_helper"

RSpec.describe StationIndexSerializer, type: :serializer do
  it "id, name を返す" do
    station = build_stubbed(:station)
    allow(station).to receive(:display_name).and_return("新宿（運営会社）")

    json = ActiveModelSerializers::SerializableResource.new(
      station,
      serializer: StationIndexSerializer,
    ).as_json

    expect(json).to include(
      id: station.id,
      name: "新宿（運営会社）",
    )
  end
end
