require "rails_helper"

RSpec.describe SignCoordinatesService do
  describe "#call" do
    let!(:secret) { "test-secret" }
    let!(:lat)    { "35.6789" }
    let!(:lng)    { "139.1234" }
    let!(:now) { Time.zone.local(2025, 1, 1, 12, 0, 0) }
    let!(:service) do
      SignCoordinatesService.new(secret:, clock: -> { now })
    end

    let!(:result) { service.call(lat, lng) }

    it "5 桁に丸めた文字列を返す" do
      expect(result[:lat]).to eq("35.67890")
      expect(result[:lng]).to eq("139.12340")
    end

    it "expires_at は含める" do
      expires_at = (now + 1.hour).to_i
      expect(result[:exp]).to eq(expires_at)
    end

    it "lat と lng と expires_at を材料にした HMAC 署名を返す" do
      expires_at = (now + 1.hour).to_i
      expect_data = "35.67890, 139.12340, #{expires_at}"
      expected_sig = OpenSSL::HMAC.hexdigest("SHA256", secret, expect_data)

      expect(result[:sig]).to eq(expected_sig)
    end
  end
end
