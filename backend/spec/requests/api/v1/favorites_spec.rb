require "rails_helper"

RSpec.describe "Api::V1::FavoritesController", type: :request do
  let!(:user) { create(:user) }
  let!(:user_auth) { create(:user_auth, user:) }
  let!(:auth_headers) { user_auth.create_new_auth_token }

  def group_for(history_id)
    data.find {|g| g.dig(:search_history, :id) == history_id }
  end

  describe "GET /api/v1/favorites#status" do
    let!(:history)  { create(:search_history, user:) }
    let!(:favorite) { create(:favorite, user:, search_history: history, hotpepper_id: "HP-1") }

    context "未認証のとき" do
      it "401を返す" do
        get status_api_v1_favorites_path,
            params: { search_history_id: history.id, hotpepper_id: "HP-1" }

        expect_unauthorized_json!
      end
    end

    context "お気に入りが存在するとき" do
      it "true と favorite_id を返す" do
        get status_api_v1_favorites_path,
            params: { search_history_id: history.id, hotpepper_id: "HP-1" },
            headers: auth_headers

        expect_status_ok!
        expect(data[:is_favorite]).to be(true)
        expect(data[:favorite_id]).to eq(favorite.id)
      end
    end

    context "お気に入りが存在しないとき" do
      it "false と nil を返す" do
        get status_api_v1_favorites_path,
            params: { search_history_id: history.id, hotpepper_id: "HP-NONE" },
            headers: auth_headers

        expect_status_ok!
        expect(data[:is_favorite]).to be(false)
        expect(data[:favorite_id]).to be_nil
      end
    end

    context "必須パラメータが不足しているとき" do
      it "hotpepper_id がなければ 400 を返す" do
        get status_api_v1_favorites_path,
            params: { search_history_id: history.id },
            headers: auth_headers

        expect_bad_request_json!(message: "必須パラメータが不足しています: hotpepper_id")
      end

      it "search_history_id がなければ 400 を返す" do
        get status_api_v1_favorites_path,
            params: { hotpepper_id: "HP-1" },
            headers: auth_headers

        expect_bad_request_json!(message: "必須パラメータが不足しています: search_history_id")
      end
    end
  end

  describe "GET /api/v1/favorites#index" do
    context "未認証のとき" do
      it "401を返す" do
        get api_v1_favorites_path
        expect_unauthorized_json!
      end
    end

    context "グルーピング" do
      let!(:tokyo_ueno) do
        create(:search_history, :with_start_stations, :with_favorites,
               user:, station_keys: %i[tokyo ueno], hotpepper_ids: %w[HP-1 HP-2])
      end
      let!(:kanda_meguro) do
        create(:search_history, :with_start_stations, :with_favorites,
               user:, station_keys: %i[kanda meguro], hotpepper_ids: %w[HP-3])
      end

      it "station_names と hotpepper_id が正しい" do
        get api_v1_favorites_path, headers: auth_headers

        expect_status_ok!
        expect(data).to be_an(Array)

        g_tokyo_ueno   = group_for(tokyo_ueno.id)
        g_kanda_meguro = group_for(kanda_meguro.id)

        expect(g_tokyo_ueno[:favorites].map {|h| h[:hotpepper_id] }).to match_array(%w[HP-1 HP-2])
        expect(g_kanda_meguro[:favorites].map {|h| h[:hotpepper_id] }).to match_array(%w[HP-3])

        expect(g_tokyo_ueno.dig(:search_history, :station_names)).to match_array(%w[東京 上野])
        expect(g_kanda_meguro.dig(:search_history, :station_names)).to match_array(%w[神田 目黒])
      end
    end

    context "ページング(limit=1)" do
      before do
        create(:search_history, :with_start_stations, :with_favorites,
               user:, station_keys: %i[tokyo ueno])
        create(:search_history, :with_start_stations, :with_favorites,
               user:, station_keys: %i[kanda meguro])
      end

      it "1ページ目" do
        get api_v1_favorites_path,
            params: { page: 1, limit: 1 },
            headers: auth_headers

        expect_status_ok!
        expect(data).to be_an(Array)
        expect(data.length).to eq(1)
        expect(meta[:current_page]).to eq(1)
        expect(meta[:has_more]).to be(true)
      end

      it "2ページ目" do
        get api_v1_favorites_path,
            params: { page: 2, limit: 1 },
            headers: auth_headers

        expect_status_ok!
        expect(data).to be_an(Array)
        expect(data.length).to eq(1)
        expect(meta[:current_page]).to eq(2)
        expect(meta[:has_more]).to be(false)
      end
    end
  end

  describe "GET /api/v1/favorites#index パラメータ防御" do
    before do
      create(:search_history, :with_start_stations, :with_favorites, user:)
      create(:search_history, :with_start_stations, :with_favorites, user:)
    end

    it "page=0 は 1 として扱う" do
      get api_v1_favorites_path,
          params: { page: 0, limit: 1 },
          headers: auth_headers

      expect_status_ok!
      expect(meta[:current_page]).to eq(1)
      expect(data.length).to eq(1)
    end

    it "page が不正文字列でも 1 として扱う" do
      get api_v1_favorites_path,
          params: { page: "oops", limit: 1 },
          headers: auth_headers

      expect_status_ok!
      expect(meta[:current_page]).to eq(1)
    end

    it "limit=0 は 1 に丸める" do
      get api_v1_favorites_path,
          params: { page: 1, limit: 0 },
          headers: auth_headers

      expect_status_ok!
      expect(data.length).to eq(1)
      expect(meta[:has_more]).to be(true)
    end

    it "limit が不正文字列でも デフォルト(3) を使う" do
      get api_v1_favorites_path,
          params: { page: 1, limit: "NaN" },
          headers: auth_headers

      expect_status_ok!
      expect(data.length).to eq(2)
      expect(meta[:has_more]).to be(false)
    end

    it "limit が上限(10)を超えたら 10 に丸める" do
      get api_v1_favorites_path,
          params: { page: 1, limit: 9999 },
          headers: auth_headers

      expect_status_ok!
      expect(data.length).to be <= 10
    end
  end

  describe "POST /api/v1/favorites#create" do
    let!(:history_tokyo_ueno) { create(:search_history, user:) }

    context "未認証のとき" do
      it "401を返す" do
        post api_v1_favorites_path,
             params: { favorite: { search_history_id: history_tokyo_ueno.id, hotpepper_id: "HP-999" } }

        expect_unauthorized_json!
      end
    end

    it "お気に入りを作成して 201 を返す" do
      post api_v1_favorites_path,
           params: { favorite: { search_history_id: history_tokyo_ueno.id, hotpepper_id: "HP-999" } },
           headers: auth_headers

      expect_status_created!
      expect(data).to include(:id, :hotpepper_id, :search_history_id)
      expect(data[:hotpepper_id]).to eq("HP-999")
    end

    it "必須パラメータが不足していたら 400 を返す" do
      post api_v1_favorites_path,
           params: { favorite: { hotpepper_id: "HP-999" } },
           headers: auth_headers

      expect_bad_request_json!(message: "必須パラメータが不足しています: search_history_id")
    end
  end

  describe "DELETE /api/v1/favorites#destroy" do
    let!(:history) { create(:search_history, user:) }
    let!(:favorite) { create(:favorite, user:, search_history: history, hotpepper_id: "HP-DEL") }

    context "未認証のとき" do
      it "401を返す" do
        delete api_v1_favorite_path(favorite)

        expect_unauthorized_json!
      end
    end

    it "お気に入りを削除して 200 を返す" do
      delete api_v1_favorite_path(favorite), headers: auth_headers

      expect_status_ok!
      expect(data).to eq({ id: favorite.id, hotpepper_id: "HP-DEL" })
      expect(Favorite.where(id: favorite.id)).not_to exist
    end

    it "存在しない ID なら 404 を返す" do
      delete api_v1_favorite_path(9_999_999), headers: auth_headers

      expect_not_found_json!(message: "リソースが見つかりません")
    end
  end
end
