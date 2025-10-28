require "rails_helper"

RSpec.describe "Api::V1::FavoriteTokensController", type: :request do
  let!(:user) { create(:user) }
  let!(:user_auth) { create(:user_auth, user:) }
  let!(:auth_headers) { user_auth.create_new_auth_token }
  let!(:search_history) { create(:search_history, user:) }

  let(:coords_params) do
    { lat: "35.12345", lng: "139.54321", sig: "SIGNED", exp: "173000000" }
  end

  let(:verify_service) { instance_double(VerifyCoordinatesService) }

  def verify_favorite_token_issued(user_id, search_history_id, restaurant_id)
    expect(FavoriteToken).to have_received(:issue).with(
      user_id:,
      restaurant_id:,
      context: { search_history_id: },
    )
  end

  before do
    allow(VerifyCoordinatesService).to receive(:new).and_return(verify_service)
  end

  describe "POST /api/v1/favorite_tokens/batch" do
    context "未認証ユーザー" do
      it "401 を返す" do
        post batch_api_v1_favorite_tokens_path,
             params: { search_history_id: search_history.id,
                       **coords_params,
                       restaurant_ids: %w[J001128359 J001238421] }

        expect_unauthorized_json!
      end
    end

    context "認証ユーザー" do
      before do
        allow(verify_service).to receive(:call).and_return(true)
        allow(FavoriteToken).to receive(:issue) do |**kwargs|
          "token-#{kwargs[:restaurant_id]}"
        end
      end

      context "署名が正常なとき" do
        let(:restaurant_ids) { %w[J001116434 J001116434 J001266017 J001279728] }
        let(:unique_ids) { %w[J001116434 J001266017 J001279728] }

        it "検索履歴の available_restaurant_ids を更新する" do
          post batch_api_v1_favorite_tokens_path,
               params: { search_history_id: search_history.id,
                         **coords_params,
                         restaurant_ids: },
               headers: auth_headers

          expect_status_ok!

          expect(search_history.reload.available_restaurant_ids).to eq(unique_ids)
        end

        it "トークンを発行する" do
          post batch_api_v1_favorite_tokens_path,
               params: { search_history_id: search_history.id,
                         **coords_params,
                         restaurant_ids: },
               headers: auth_headers

          unique_ids.each do |id|
            verify_favorite_token_issued(user.id, search_history.id, id)
          end

          expect(data[:tokens]).to eq(
            unique_ids.map {|id| { restaurant_id: id, favorite_token: "token-#{id}" } },
          )
        end
      end

      context "署名が不正なとき" do
        before do
          allow(verify_service).to receive(:call).and_return(false)
        end

        it "422 を返し、履歴更新やトークン発行は行わない" do
          expect {
            post batch_api_v1_favorite_tokens_path,
                 params: { search_history_id: search_history.id,
                           **coords_params,
                           restaurant_ids: %w[J001238421 J000002471 J001116434] },
                 headers: auth_headers
          }.not_to change { search_history.reload.available_restaurant_ids }

          expect_unprocessable_json!(message: "invalid_search_signature")
          expect(FavoriteToken).not_to have_received(:issue)
        end
      end

      context "restaurant_ids が 100件を超えているとき" do
        let(:raw_ids) { (1..103).to_a + [5, 6, 7] }
        let(:restaurant_ids) { raw_ids.map(&:to_s) }

        before do
          allow(verify_service).to receive(:call).and_return(true)
          allow(FavoriteToken).to receive(:issue) do |**kwargs|
            "token-#{kwargs[:restaurant_id]}"
          end
        end

        it "先頭から重複排除後の 100件だけを対象にする" do
          post batch_api_v1_favorite_tokens_path,
               params: { search_history_id: search_history.id,
                         **coords_params, restaurant_ids: },
               headers: auth_headers

          expect_status_ok!

          used = restaurant_ids.uniq.first(100)
          expect(search_history.reload.available_restaurant_ids).to eq(used)

          expect(data[:tokens].size).to eq(100)
          expect(data[:tokens].map { _1[:restaurant_id] }).to eq(used)
          expect(data[:tokens].map { _1[:favorite_token] }).to eq(used.map {|id| "token-#{id}" })

          expect(FavoriteToken).to have_received(:issue).exactly(100).times
        end
      end

      context "存在しない search_history_id のとき" do
        let!(:other_user) { create(:user) }
        let!(:other_history) { create(:search_history, user: other_user) }

        before do
          allow(verify_service).to receive(:call).and_return(true)
        end

        it "404 を返す" do
          post batch_api_v1_favorite_tokens_path,
               params: { search_history_id: other_history.id,
                         **coords_params,
                         restaurant_ids: %w[J001128359 J001238421] },
               headers: auth_headers

          expect_not_found_json!(message: "リソースが見つかりません")
        end
      end

      context "必須パラメータが欠落しているとき" do
        before do
          allow(verify_service).to receive(:call).and_return(true)
        end

        it "400 を返す" do
          post batch_api_v1_favorite_tokens_path,
               params: { search_history_id: search_history.id,
                         **coords_params.except(:lat), # lat 欠落
                         restaurant_ids: %w[J001128359 J001238421] },
               headers: auth_headers

          expect_bad_request_json!(message: "必須パラメータが不足しています: lat")
        end
      end
    end
  end
end
