require "rails_helper"

RSpec.describe "Api::V1::SearchHistoriesController", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let!(:user)        { create(:user) }
  let!(:user_auth)   { create(:user_auth, user: user) }
  let!(:auth_headers) { user_auth.create_new_auth_token }

  def post_create(ids, headers: auth_headers)
    post api_v1_search_histories_path,
         params: { search_history: { station_ids: ids } },
         headers: headers
  end

  def expect_created_with_names(names)
    expect(response).to have_http_status(:created)
    expect(json[:success]).to be(true)
    expect(data[:station_names]).to eq(Array(names).sort)
  end

  def stub_user_search_histories_race!(user:, key:, canonical:)
    assoc = instance_double(ActiveRecord::Associations::CollectionProxy)

    allow(user).to receive(:search_histories).and_return(assoc)
    # 1回目の確認は見つからない
    allow(assoc).to receive(:find_by).with(station_key: key).and_return(nil)
    # 作成は一意制約違反で失敗（別スレッドが先に作った想定）
    allow(assoc).to receive(:create!).with(station_key: key).and_raise(ActiveRecord::RecordNotUnique)
    # 救済の再検索では既存正規レコードを返す
    allow(assoc).to receive(:find_by!).with(station_key: key).and_return(canonical)
  end

  describe "POST /api/v1/search_histories 正常系" do
    context "未認証" do
      it "401を返す" do
        post api_v1_search_histories_path,
             params: { search_history: { station_ids: [] } }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "認証済み" do
      context "駅IDが2件のとき（下限）" do
        let!(:stations) { create_list(:station, 2) }
        let(:requested_ids) { stations.map(&:id) }

        it "SearchHistory +1 / 関連 +2 / 201を返す" do
          expect {
            post_create(requested_ids)
          }.to change { SearchHistory.count }.by(1).
                 and change { SearchHistoryStartStation.count }.by(requested_ids.size)

          expect_created_with_names(stations.map(&:name))
        end
      end

      context "駅IDが6件のとき（上限）" do
        let!(:stations) { create_list(:station, 6) }
        let(:requested_ids) { stations.map(&:id) }

        it "SearchHistory +1 / 関連 +6 / 201を返す" do
          expect {
            post_create(requested_ids)
          }.to change { SearchHistory.count }.by(1).
                 and change { SearchHistoryStartStation.count }.by(requested_ids.size)

          expect_created_with_names(stations.map(&:name))
        end
      end

      context "既存履歴がDBに存在するとき" do
        let!(:tokyo) { create(:station, station_key: :tokyo) }
        let!(:kanda) { create(:station, station_key: :kanda) }
        let!(:existing_history) do
          create(:search_history, :with_start_stations, user: user, stations: [tokyo, kanda], updated_at: 3.days.ago)
        end

        it "順不同でも再利用し、201を返す" do
          expect {
            post_create([kanda.id, tokyo.id])
          }.not_to change { [SearchHistory.count, SearchHistoryStartStation.count] }

          expect_created_with_names([tokyo.name, kanda.name])
          expect(data[:id]).to eq(existing_history.id)
        end

        it "updated_at が更新される" do
          travel_to(Time.zone.local(2025, 1, 1, 12, 0, 0)) do
            post_create([kanda.id, tokyo.id])

            expect(existing_history.reload.updated_at).to be_within(1.second).of(Time.current)
          end
        end
      end

      context "同時実行（同一ユーザー）" do
        let!(:tokyo) { create(:station, station_key: :tokyo) }
        let!(:kanda) { create(:station, station_key: :kanda) }

        it "一意制約にあたっても再検索で既存を返し、重複作成しない" do
          ids = [tokyo.id, kanda.id].sort
          key = ids.join("-")
          canonical = create(:search_history, :with_start_stations, user: user, stations: [tokyo, kanda])

          stub_user_search_histories_race!(user:, key:, canonical:)

          aggregate_failures do
            expect {
              post_create([kanda.id, tokyo.id])
            }.not_to change { [SearchHistory.count, SearchHistoryStartStation.count] }
            expect_created_with_names([tokyo.name, kanda.name])
            expect(data[:id]).to eq(canonical.id)
          end
        end
      end
    end
  end

  describe "POST /api/v1/search_histories 異常系" do
    let!(:tokyo) { create(:station, station_key: :tokyo) }

    context "駅IDが空配列のとき" do
      it "422を返す" do
        post_create([])
        expect_unprocessable_json!(message: "station_idsは2〜6件で指定してください")
      end
    end

    context "駅IDが1件のとき（下限未満）" do
      it "422を返す" do
        post_create([tokyo.id])
        expect_unprocessable_json!(message: "station_idsは2〜6件で指定してください")
      end
    end

    context "駅IDが7件のとき（上限超過）" do
      it "422を返す" do
        station_ids = create_list(:station, 7).map(&:id)
        post_create(station_ids)
        expect_unprocessable_json!(message: "station_idsは2〜6件で指定してください")
      end
    end

    context "駅IDに整数以外の型が混在しているとき" do
      it "422を返す" do
        post_create([tokyo.id, "abc"])
        expect_unprocessable_json!(message: "station_idsは整数のみ指定してください")
      end
    end

    context "駅IDに存在しないIDが含まれるとき" do
      it "422を返す" do
        post_create([tokyo.id, 9_999_999])
        expect_unprocessable_json!(message: "存在しない駅IDが含まれています")
      end
    end
  end
end
