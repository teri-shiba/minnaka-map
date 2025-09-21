require "rails_helper"

RSpec.describe CurrentUserSerializer, type: :serializer do
  describe "#as_json" do
    context "ユーザーが存在する場合" do
      let(:user) { build_stubbed(:user, name: "山田太郎") }
      let(:user_auth) {
        build_stubbed(
          :user_auth,
          user: user,
          email: "yamada@example.com",
          provider: "line",
          uid: "uid-123",
        )
      }

      it "id, email, name, provider をシリアライズする" do
        json = ActiveModelSerializers::SerializableResource.new(
          user_auth,
          serializer: CurrentUserSerializer,
        ).as_json

        expect(json).to include(
          id: user.id,
          email: "yamada@example.com",
          name: "山田太郎",
          provider: "line",
        )
      end
    end

    context "ユーザー名が nil の場合" do
      let(:user) { build_stubbed(:user, name: nil) }
      let(:user_auth) {
        build_stubbed(
          :user_auth,
          user: user,
          email: "noname@example.com",
          provider: "line",
          uid: "uid-456",
        )
      }

      it "name は nil を返す" do
        json = ActiveModelSerializers::SerializableResource.new(
          user_auth,
          serializer: CurrentUserSerializer,
        ).as_json

        expect(json[:id]).to eq(user.id)
        expect(json[:email]).to eq "noname@example.com"
        expect(json[:name]).to be_nil
        expect(json[:provider]).to eq "line"
      end
    end
  end
end
