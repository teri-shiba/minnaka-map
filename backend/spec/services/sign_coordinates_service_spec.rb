require "rails_helper"

RSpec.describe SignCoordinatesService do
  let!(:secret) { "test-secret" }
  let!(:fixed_now) { Time.zone.local(2099, 1, 1, 0, 0, 0) }
  let!(:clock) { -> { fixed_now } }

  context "開発環境のとき" do
    subject(:service) {
      SignCoordinatesService.new(secret: secret,
                                 production: false,
                                 clock: clock)
    }

    it "expires_at なしで署名する" do
      payload = service.call(35.1, 139.1)

      expect(payload[:latitude]).to eq("35.10000")
      expect(payload[:longitude]).to eq("139.10000")
      expect(payload.has_key?(:expires_at)).to be(false)

      data = "35.10000, 139.10000"
      expected_sig = OpenSSL::HMAC.hexdigest("SHA256", secret, data)
      expect(payload[:signature]).to eq(expected_sig)
    end
  end

  context "本番環境のとき" do
    subject(:service) {
      SignCoordinatesService.new(secret: secret,
                                 production: true,
                                 clock: clock)
    }

    it "expires_at 付きで署名する" do
      payload = service.call(35.1, 139.1)

      expect(payload[:expires_at]).to eq((fixed_now + 1.hour).to_i)

      data = "35.10000, 139.10000, #{payload[:expires_at]}"
      expected_sig = OpenSSL::HMAC.hexdigest("SHA256", secret, data)
      expect(payload[:signature]).to eq(expected_sig)
    end
  end
end
