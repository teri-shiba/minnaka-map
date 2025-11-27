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

  describe "GET /api/v1/midpoint 成功" do
    before do
      allow(Geocoder::Calculations).to receive(:geographic_center).and_return([35.1, 139.1])
    end

    let!(:station_a) { create(:station, latitude: 35.0, longitude: 139.0) }
    let!(:station_b) { create(:station, latitude: 35.2, longitude: 139.2) }
    let!(:station_ids) { [station_a.id, station_b.id] }
    let(:now) { Time.zone.local(2099, 1, 1, 0, 0, 0) }

    it "expires_at 付きで返す" do
      travel_to(now) do
        get api_v1_midpoint_path, params: { station_ids: }

        expected_expires = (now + 1.hour).to_i
        expected_sig = hmac_for("35.10000", "139.10000", expected_expires.to_s)

        expect_status_ok!
        expect(data[:midpoint]).to eq(lat: "35.10000", lng: "139.10000")
        expect(data[:sig]).to eq(expected_sig)
        expect(data[:exp]).to eq(expected_expires)
      end
    end
  end

  describe "GET /api/v1/midpoint 入力バリデーション" do
    context "station_ids が空のとき" do
      it "422 を返す" do
        allow(Station).to receive(:where)
        get api_v1_midpoint_path, params: { station_ids: [] }
        expect(Station).not_to have_received(:where)
        expect_unprocessable_json!(message: "station_ids is empty")
      end
    end

    context "上限（MAX_STATIONS=6）を超過したとき" do
      it "422 を返す" do
        allow(Station).to receive(:where)
        get api_v1_midpoint_path, params: { station_ids: (1..7).to_a }
        expect(Station).not_to have_received(:where)
        expect_unprocessable_json!(message: "too many stations")
      end
    end

    context "DB に存在しない id が含まれているとき" do
      it "422 を返し、details に欠番が入る" do
        get api_v1_midpoint_path, params: { station_ids: [999_999_999] }
        expect_unprocessable_json!(message: "not found ids", details: [999_999_999])
      end
    end
  end

  describe "GET /api/v1/midpoint/validate" do
    context "検証成功（期限内）" do
      let(:now) { Time.zone.local(2099, 1, 1, 0, 0, 0) }

      it "200 { valid: true } を返す" do
        travel_to(now) do
          lat = "%.5f" % lat.to_f
          lng = "%.5f" % lng.to_f
          exp = (now + 10.minutes).to_i
          sig = hmac_for(lat, lng, exp.to_s)

          get validate_api_v1_midpoint_path,
              params: { lat:, lng:, sig:, exp: }

          expect(response).to have_http_status(:ok)
          expect(json).to eq(valid: true)
        end
      end
    end

    context "検証失敗（期限切れ）" do
      let(:now) { Time.zone.local(2099, 1, 1, 0, 0, 0) }

      it "400 { valid: false } を返す" do
        travel_to(now) do
          lat = "0"
          lng = "0"
          exp = (now - 1.minute).to_i
          sig = hmac_for(lat, lng, exp.to_s)

          get validate_api_v1_midpoint_path,
              params: { lat:, lng:, sig:, exp: }

          expect(response).to have_http_status(:bad_request)
          expect(json).to eq(valid: false)
        end
      end
    end
  end
end
