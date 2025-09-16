require "rails_helper"

RSpec.describe "Api::V1::SharedFavoriteListsController", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let!(:user) { create(:user) }
  let!(:user_auth) { create(:user_auth, user:) }

  describe "GET /api/v1/shared_favorite_lists#show" do
    context "共有リストが存在し、お気に入りが1件以上あるとき" do
      let!(:search_history) { create(:search_history, :with_start_stations, user:, station_keys: %i[tokyo kanda]) }

      let!(:shared_favorite_list) { create(:shared_favorite_list, :public, user:, search_history:, title: "東京・神田") }
      let!(:favorite) { create(:favorite, search_history:, hotpepper_id: "HP-1") }

      it "Serializerで定めた形式で、200を返す" do
        get api_v1_shared_favorite_list_path(shared_favorite_list)

        expect_status_ok!
        expect(data).to match(
          title: "東京・神田",
          created_at: shared_favorite_list.created_at.iso8601,
          search_history: {
            id: search_history.id,
            station_names: search_history.station_names,
          },
          favorites: contain_exactly({ id: favorite.id, hotpepper_id: "HP-1" }),
        )
      end
    end

    context "share_uuidが存在しないとき" do
      it "404とエラーメッセージを返す" do
        get api_v1_shared_favorite_list_path("not-found-uuid")

        expect(response).to have_http_status(:not_found)
        expect(error[:message]).to eq("共有リストが見つかりません")
      end
    end

    context "非公開の共有リストにアクセスしたとき" do
      let!(:search_history) { create(:search_history, user:) }
      let!(:private_list) { create(:shared_favorite_list, :private, user:, search_history:) }

      it "404とエラーメッセージを返す" do
        get api_v1_shared_favorite_list_path(private_list)

        expect(response).to have_http_status(:not_found)
        expect(error[:message]).to eq("共有リストが見つかりません")
      end
    end

    context "共有リストはあるが、お気に入りが0件のとき" do
      let!(:search_history) { create(:search_history, user:) }
      let!(:empty_list) { create(:shared_favorite_list, :public, user:, search_history:) }
      it "404とエラーメッセージを返す" do
        get api_v1_shared_favorite_list_path(empty_list)

        expect(response).to have_http_status(:not_found)
        expect(error[:message]).to eq("共有リストが見つかりません")
      end
    end
  end

  describe "POST /api/v1/shared_favorite_lists#create" do
    context "未認証のとき" do
      let!(:search_history) { create(:search_history, user:) }

      it "401を返す" do
        post api_v1_shared_favorite_lists_path, params: { search_history_id: search_history.id }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "公開済みの共有リストが未作成のとき" do
      let!(:auth_headers) { user_auth.create_new_auth_token }
      let!(:search_history) { create(:search_history, :with_start_stations, user:, station_keys: %i[tokyo kanda]) }

      it "201とレコードを作成する" do
        expect {
          post api_v1_shared_favorite_lists_path,
               params: { search_history_id: search_history.id },
               headers: auth_headers
        }.to change { SharedFavoriteList.count }.by(1)

        expect_status_created!
      end

      it "Serializerで定めた形式でデータを返す" do
        post api_v1_shared_favorite_lists_path,
             params: { search_history_id: search_history.id },
             headers: auth_headers

        expect_status_created!
        expect(data).to match(
          share_uuid: a_kind_of(String),
          title: "東京・神田",
          is_existing: false,
        )
      end

      it "作成レコードの属性が一致する" do
        expected_title = search_history.station_names.join("・")
        post api_v1_shared_favorite_lists_path,
             params: { search_history_id: search_history.id },
             headers: auth_headers

        created = SharedFavoriteList.find_by(share_uuid: data[:share_uuid])
        expect(created).to have_attributes(
          user_id: user.id,
          search_history_id: search_history.id,
          is_public: true,
          title: expected_title,
        )
      end
    end

    context "同じ user * search_history の公開リストが既にあるとき" do
      let!(:auth_headers) { user_auth.create_new_auth_token }

      let!(:search_history) { create(:search_history, :with_start_stations, user:, station_keys: %i[tokyo kanda]) }
      let!(:existing) { create(:shared_favorite_list, :public, user:, search_history:, title: "既存タイトル") }

      it "新規作成せず、既存レコードを返し is_existing: true になる" do
        expect {
          post api_v1_shared_favorite_lists_path, params: { search_history_id: search_history.id }, headers: auth_headers
        }.not_to change { SharedFavoriteList.count }

        expect_status_ok!
        expect(data).to include(
          share_uuid: existing.share_uuid,
          title: "既存タイトル",
          is_existing: true,
        )
      end
    end

    context "search_history_idが未指定のとき" do
      let!(:auth_headers) { user_auth.create_new_auth_token }

      it "400とエラーメッセージを返す" do
        post api_v1_shared_favorite_lists_path, params: {}, headers: auth_headers

        expect_bad_request_json!(message: "必須パラメータが不足しています: search_history_id")
      end
    end
  end
end
