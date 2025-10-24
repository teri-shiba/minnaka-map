require "rails_helper"

RSpec.describe "Api::V1::MidpointsController", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let!(:secret) { "test-secret" }

  def hmac_for(*parts)
    OpenSSL::HMAC.hexdigest("SHA256", secret, parts.join(", "))
  end

  before do
    allow(Rails.application).to receive(:secret_key_base).and_return(secret)
  end

  shared_examples "非本番環境では署名と期限を返さない" do
    it "midpoint のみ返す" do
      get api_v1_midpoint_path, params: { area: { station_ids: } }

      expect_status_ok!
      expect(data[:midpoint]).to eq(latitude: "35.10000", longitude: "139.10000")
      expect(data).not_to have_key(:signature)
      expect(data).not_to have_key(:expires_at)
    end
  end

  describe "GET /api/v1/midpoint 成功" do
    before do
      allow(Geocoder::Calculations).to receive(:geographic_center).and_return([35.1, 139.1])
    end

    let!(:station_a) { create(:station, latitude: 35.0, longitude: 139.0) }
    let!(:station_b) { create(:station, latitude: 35.2, longitude: 139.2) }
    let!(:station_ids) { [station_a.id, station_b.id] }

    context "development 環境のとき" do
      before { set_env!("development") }

      include_examples "非本番環境では署名と期限を返さない"
    end

    context "test 環境のとき" do
      before { set_env!("test") }

      include_examples "非本番環境では署名と期限を返さない"
    end

    context "production 環境のとき" do
      let(:now) { Time.zone.local(2099, 1, 1, 0, 0, 0) }

      before { set_env!("production") }

      it "expires_at 付きで返す" do
        travel_to(now) do
          get api_v1_midpoint_path, params: { area: { station_ids: } }

          expected_expires = (now + 1.hour).to_i
          expected_sig = hmac_for("35.10000", "139.10000", expected_expires.to_s)

          expect_status_ok!
          expect(data[:midpoint]).to eq(latitude: "35.10000", longitude: "139.10000")
          expect(data[:signature]).to eq(expected_sig)
          expect(data[:expires_at]).to eq(expected_expires)
        end
      end
    end
  end

  describe "GET /api/v1/midpoint 入力バリデーション" do
    context "station_ids が空のとき" do
      it "422 を返す" do
        allow(Station).to receive(:where)
        get api_v1_midpoint_path, params: { area: { station_ids: [] } }
        expect(Station).not_to have_received(:where)
        expect_unprocessable_json!(message: "station_ids is empty")
      end
    end

    context "上限（MAX_STATIONS=6）を超過したとき" do
      it "422 を返す" do
        allow(Station).to receive(:where)
        get api_v1_midpoint_path, params: { area: { station_ids: (1..7).to_a } }
        expect(Station).not_to have_received(:where)
        expect_unprocessable_json!(message: "too many stations")
      end
    end

    context "DB に存在しない id が含まれているとき" do
      it "422 を返し、details に欠番が入る" do
        get api_v1_midpoint_path, params: { area: { station_ids: [9999] } }
        expect_unprocessable_json!(message: "not found ids", details: [9999])
      end
    end
  end

  describe "GET /api/v1/midpoint/validate" do
    context "検証成功（テスト環境）" do
      before { set_env!("test") }

      it "200 { valid: true } を返す" do
        lat = "35.1"
        lng = "139.0"

        get validate_api_v1_midpoint_path,
            params: { latitude: lat, longitude: lng }

        expect(response).to have_http_status(:ok)
        expect(json).to eq(valid: true)
      end

      it "署名が含まれていたら 400 { valid: false } を返す" do
        lat = "35.1"
        lng = "139.0"
        sig = hmac_for(lat, lng)

        get validate_api_v1_midpoint_path,
            params: { latitude: lat, longitude: lng, signature: sig }

        expect(response).to have_http_status(:bad_request)
        expect(json).to eq(valid: false)
      end
    end

    context "検証成功（本番で期限内）" do
      before { set_env!("production") }

      let(:now) { Time.zone.local(2099, 1, 1, 0, 0, 0) }

      it "200 { valid: true } を返す" do
        travel_to(now) do
          lat = "35.1"
          lng = "139.0"
          expires = (now + 10.minutes).to_i
          sig = hmac_for(lat, lng, expires.to_s)

          get validate_api_v1_midpoint_path,
              params: { latitude: lat, longitude: lng, signature: sig, expires_at: expires }

          expect(response).to have_http_status(:ok)
          expect(json).to eq(valid: true)
        end
      end
    end

    context "検証失敗（本番で期限切れ）" do
      before { set_env!("production") }

      let(:now) { Time.zone.local(2099, 1, 1, 0, 0, 0) }

      it "400 { valid: false } を返す" do
        travel_to(now) do
          lat = "0"
          lng = "0"
          expired = (now - 1.minute).to_i
          sig = hmac_for(lat, lng, expired.to_s)

          get validate_api_v1_midpoint_path,
              params: { latitude: lat, longitude: lng, signature: sig, expires_at: expired }

          expect(response).to have_http_status(:bad_request)
          expect(json).to eq(valid: false)
        end
      end
    end
  end
end
