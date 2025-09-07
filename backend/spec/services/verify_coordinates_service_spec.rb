require "rails_helper"

RSpec.describe VerifyCoordinatesService do
  let!(:secret) { "test-secret" }
  let!(:fixed_now) { Time.zone.local(2099, 1, 1, 0, 0, 0) }
  let!(:clock) { -> { fixed_now } }

  context "開発環境のとき" do
    subject(:service) {
      VerifyCoordinatesService.new(secret: secret,
                                   production: false,
                                   clock: clock)
    }

    it "expires_at なしで検証成功" do
      data = "35.10000, 139.10000"
      sig = OpenSSL::HMAC.hexdigest("SHA256", secret, data)

      expect(service.call("35.10000", "139.10000", sig, nil)).to be(true)
    end

    it "署名不一致なら失敗" do
      expect(service.call("35.10000", "139.10000", "bad", nil)).to be(false)
    end
  end

  context "本番環境のとき" do
    subject(:service) {
      VerifyCoordinatesService.new(secret: secret,
                                   production: true,
                                   clock: clock)
    }

    it "期限内なら成功" do
      exp = (fixed_now + 30.minutes).to_i
      data = "35.10000, 139.10000, #{exp}"
      sig = OpenSSL::HMAC.hexdigest("SHA256", secret, data)

      expect(service.call("35.10000", "139.10000", sig, exp)).to be(true)
    end

    it "期限切れなら失敗" do
      exp = (fixed_now - 1.minute).to_i
      data = "35.10000, 139.10000, #{exp}"
      sig = OpenSSL::HMAC.hexdigest("SHA256", secret, data)

      expect(service.call("35.10000", "139.10000", sig, exp)).to be(false)
    end

    it "expires_at が空なら失敗" do
      data = "35.10000, 139.10000, "
      sig = OpenSSL::HMAC.hexdigest("SHA256", secret, data)

      expect(service.call("35.10000", "139.10000", sig, nil)).to be(false)
    end
  end
end
