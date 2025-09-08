require "rails_helper"

RSpec.describe "Api::V1::FavoritesController", type: :request do
  let!(:user)      { create(:user) }
  let!(:user_auth) { create(:user_auth, user: user) }

  before do
    allow_any_instance_of(Api::V1::FavoritesController).
      to receive(:authenticate_user!).and_return(true)
    allow_any_instance_of(Api::V1::FavoritesController).
      to receive(:current_user).and_return(user_auth)
  end

  def group_for(history_id)
    json[:data].find {|g| g.dig(:search_history, :id) == history_id }
  end

  describe "GET /api/v1/favorites#index" do
    it "グルーピング内容が正しい（station_names / hotpepper_id）" do
      tokyo_ueno = create(
        :search_history,
        :with_start_stations,
        :with_favorites,
        user:,
        station_keys: %i[tokyo ueno],
        hotpepper_ids: %w[HP-1 HP-2],
      )

      kanda_meguro = create(
        :search_history,
        :with_start_stations,
        :with_favorites,
        user:,
        station_keys: %i[kanda meguro],
        hotpepper_ids: %w[HP-3],
      )

      get "/api/v1/favorites"

      expect_success_json!
      expect(json[:data]).to be_an(Array)

      g_tokyo_ueno   = group_for(tokyo_ueno.id)
      g_kanda_meguro = group_for(kanda_meguro.id)

      expect(g_tokyo_ueno[:favorites].map {|h| h[:hotpepper_id] }).to match_array(%w[HP-1 HP-2])
      expect(g_kanda_meguro[:favorites].map {|h| h[:hotpepper_id] }).to match_array(%w[HP-3])

      expect(g_tokyo_ueno[:search_history][:station_names]).to match_array(%w[東京 上野])
      expect(g_kanda_meguro[:search_history][:station_names]).to match_array(%w[神田 目黒])
    end

    it "ページングが効く(limit=1)" do
      create(:search_history, :with_start_stations, :with_favorites, user:, station_keys: %i[tokyo ueno])
      create(:search_history, :with_start_stations, :with_favorites, user:, station_keys: %i[kanda meguro])

      get "/api/v1/favorites", params: { page: 1, limit: 1 }
      expect_success_json!
      expect(json[:data]).to be_an(Array)
      expect(json[:data].length).to eq(1)
      expect(json[:meta][:current_page]).to eq(1)
      expect(json[:meta][:has_more]).to be(true)

      get "/api/v1/favorites", params: { page: 2, limit: 1 }
      expect_success_json!
      expect(json[:data]).to be_an(Array)
      expect(json[:data].length).to eq(1)
      expect(json[:meta][:current_page]).to eq(2)
      expect(json[:meta][:has_more]).to be(false)
    end
  end

  describe "POST /api/v1/favorites#create" do
    before { @history_tokyo_ueno = create(:search_history, user:) }

    it "お気に入りを作成して 201 を返す" do
      params = { favorite: { search_history_id: @history_tokyo_ueno.id, hotpepper_id: "HP-999" } }

      post "/api/v1/favorites", params: params

      expect_success_json!(status: :created)
      expect(json[:data]).to include(:id, :hotpepper_id, :search_history_id)
      expect(json[:data][:hotpepper_id]).to eq("HP-999")
      expect(json[:message]).to eq("お気に入りに追加しました")
    end

    # TODO: コントローラーの修正が必要なので後回し（rescue -> ExceptionHandler に変更）
    it "必須パラメータが不足していたら 400 を返す" do
      post "/api/v1/favorites", params: { favorite: { hotpepper_id: "HP-999" } }

      expect_bad_request_json!(message: "必須パラメータが不足しています: search_history_id")
    end
  end

  describe "DELETE /api/v1/favorites#destroy" do
    before do
      @history = create(:search_history, user:)
      @favorite = create(:favorite, user:, search_history: @history, hotpepper_id: "HP-DEL")
    end

    it "お気に入りを削除して 200 を返す" do
      delete "/api/v1/favorites/#{@favorite.id}"

      expect_success_json!
      expect(json[:data]).to eq({ id: @favorite.id, hotpepper_id: "HP-DEL" })
      expect(json[:message]).to eq("お気に入りから削除しました")
      expect(Favorite.where(id: @favorite.id)).not_to exist
    end
  end
end
