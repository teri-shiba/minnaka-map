require "rails_helper"

RSpec.describe FavoriteTokenService do
  include ActiveSupport::Testing::TimeHelpers

  describe ".issue" do
    let(:user_id) { 11 }
    let(:restaurant_id) { "HP-123" }
    let(:search_history_id) { 321 }

    it "10分後に失効するトークンを発行する" do
      base_time = Time.zone.local(2023, 1, 1, 12, 0, 0)
      travel_to(base_time) do
        token = FavoriteTokenService.issue(user_id:, restaurant_id:, context: { search_history_id: search_history_id })

        raw = FavoriteTokenService.verify!(token)
        expect(raw).to include(
          v: 1,
          uid: user_id,
          res_id: restaurant_id,
          sh_id: search_history_id,
        )
        expect(raw[:exp]).to eq((base_time + 10.minutes).to_i)
      end
    end

    it "context の search_history_id を整数化して埋め込む" do
      token = FavoriteTokenService.issue(user_id:, restaurant_id:, context: { search_history_id: search_history_id.to_s })

      raw = FavoriteTokenService.verify!(token)
      expect(raw[:sh_id]).to eq(search_history_id)
    end

    it "search_history_id が無ければ KeyError となる" do
      expect {
        FavoriteTokenService.issue(user_id:, restaurant_id:, context: {})
      }.to raise_error(KeyError)
    end
  end

  describe ".verify!" do
    let(:user_id) { 22 }
    let(:restaurant_id) { "HP-456" }
    let(:search_history_id) { 654 }

    it "暗号化と有効期限を満たすトークンを復号してペイロードを返す" do
      base_time = Time.zone.local(2023, 1, 1, 9, 0, 0)
      travel_to(base_time) do
        token = FavoriteTokenService.issue(user_id:, restaurant_id:, context: { search_history_id: search_history_id })
        params = FavoriteTokenService.verify!(token)

        expect(params).to include(
          uid: user_id,
          res_id: restaurant_id,
          sh_id: search_history_id,
        )
        expect(params[:v]).to eq(1)
        expect(params[:exp]).to be_a(Integer)
      end
    end

    it "期限切れなら FavoriteTokenService::Expired となる" do
      base_time = Time.zone.local(2023, 1, 1, 9, 0, 0)
      travel_to(base_time) do
        token = FavoriteTokenService.issue(user_id:, restaurant_id:, context: { search_history_id: search_history_id })

        travel 11.minutes
        expect { FavoriteTokenService.verify!(token) }.to raise_error(FavoriteTokenService::Expired)
      end
    end

    it "不正なトークンなら FavoriteTokenService::Invalid となる" do
      invalid_token = "INVALID_TOKEN"
      expect { FavoriteTokenService.verify!(invalid_token) }.to raise_error(FavoriteTokenService::Invalid)
    end

    it "改ざんされたトークンで FavoriteTokenService::Invalid となる" do
      token = FavoriteTokenService.issue(user_id:, restaurant_id:, context: { search_history_id: search_history_id })

      tampered = "#{token}x"
      expect { FavoriteTokenService.verify!(tampered) }.to raise_error(FavoriteTokenService::Invalid)
    end
  end
end
