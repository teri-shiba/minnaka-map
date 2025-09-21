require "rails_helper"

RSpec.describe SharedFavoriteListCreateSerializer, type: :serializer do
  describe "#serializable_hash" do
    let!(:resource_class) do
      Struct.new(:share_uuid, :title) do
        def read_attribute_for_serialization(attr)
          public_send(attr)
        end
      end
    end

    let!(:resource) { resource_class.new("uuid-123", "東京・神田のお店") }

    context "is_existing が true のとき" do
      it "キー名 is_existing で true を出力する" do
        result = SharedFavoriteListCreateSerializer.new(resource, is_existing: true).serializable_hash.deep_symbolize_keys

        expect(result).to eq(
          share_uuid: "uuid-123",
          title: "東京・神田のお店",
          is_existing: true,
        )
      end
    end

    context "is_existing が false のとき" do
      it "キー名 is_existing で false を出力する" do
        result = SharedFavoriteListCreateSerializer.new(resource, is_existing: false).serializable_hash.deep_symbolize_keys

        expect(result).to eq(
          share_uuid: "uuid-123",
          title: "東京・神田のお店",
          is_existing: false,
        )
      end
    end
  end
end
