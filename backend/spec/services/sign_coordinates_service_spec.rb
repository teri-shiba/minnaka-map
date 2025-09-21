require "rails_helper"

RSpec.describe SignCoordinatesService do
  describe "#call" do
    let!(:secret) { "test-secret" }
    let!(:lat)    { "35.6789" }
    let!(:lng)    { "139.1234" }

    context "非本番環境のとき" do
      let!(:now) { Time.zone.local(2025, 1, 1, 12, 0, 0) }
      let!(:service) do
        SignCoordinatesService.new(
          secret:,
          production: false,
          clock: -> { now },
        )
      end

      let!(:result) { service.call(lat, lng) }

      it "5 桁に丸めた文字列を返す" do
        expect(result[:latitude]).to eq("35.67890")
        expect(result[:longitude]).to eq("139.12340")
      end

      it "signature と expires_at は含めない" do
        expect(result).not_to have_key(:signature)
        expect(result).not_to have_key(:expires_at)
      end
    end

    context "本番環境のとき" do
      let!(:now) { Time.zone.local(2025, 1, 1, 12, 0, 0) }
      let!(:service) do
        SignCoordinatesService.new(
          secret:,
          production: true,
          clock: -> { now },
        )
      end

      let!(:result) { service.call(lat, lng) }

      it "5 桁に丸めた文字列を返す" do
        expect(result[:latitude]).to eq("35.67890")
        expect(result[:longitude]).to eq("139.12340")
      end

      it "expires_at は含める" do
        expires_at = (now + 1.hour).to_i
        expect(result[:expires_at]).to eq(expires_at)
      end

      it "lat と lng と expires_at を材料にした HMAC 署名を返す" do
        expires_at = (now + 1.hour).to_i
        expect_data = "35.67890, 139.12340, #{expires_at}"
        expected_sig = OpenSSL::HMAC.hexdigest("SHA256", secret, expect_data)

        expect(result[:signature]).to eq(expected_sig)
      end
    end
  end
end
