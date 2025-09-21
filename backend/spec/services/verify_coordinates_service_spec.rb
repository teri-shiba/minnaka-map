require "rails_helper"

RSpec.describe VerifyCoordinatesService do
  describe "#call" do
    let!(:secret) { "test-secret" }
    let!(:lat)    { "35.6789" }
    let!(:lng)    { "139.1234" }

    context "非本番環境のとき" do
      let!(:now) { Time.zone.local(2025, 1, 1, 12, 0, 0) }
      let!(:service) do
        VerifyCoordinatesService.new(
          secret:,
          production: false,
          clock: -> { now },
        )
      end

      it "signature が空なら true を返す" do
        expect(service.call(lat, lng, nil, nil)).to be(true)
        expect(service.call(lat, lng, "", nil)).to be(true)
      end

      it "signature が与えられたら（値の真偽に関わらず） false を返す" do
        valid_sig   = OpenSSL::HMAC.hexdigest("SHA256", secret, "#{lat}, #{lng}")
        invalid_sig = "invalid"
        short_sig   = valid_sig[0..-2]

        expect(service.call(lat, lng, valid_sig, nil)).to be(false)
        expect(service.call(lat, lng, invalid_sig, nil)).to be(false)
        expect(service.call(lat, lng, short_sig, nil)).to be(false)
      end
    end

    context "本番環境のとき" do
      let!(:now) { Time.zone.local(2025, 1, 1, 12, 0, 0) }
      let!(:service) do
        VerifyCoordinatesService.new(
          secret:,
          production: true,
          clock: -> { now },
        )
      end

      it "signature が空なら false を返す" do
        exp = (now + 300).to_i
        expect(service.call(lat, lng, nil, exp)).to be(false)
        expect(service.call(lat, lng, "", exp)).to be(false)
      end

      it "expires_at が空なら false を返す" do
        exp = (now + 300).to_i
        sig = OpenSSL::HMAC.hexdigest("SHA256", secret, "#{lat}, #{lng}, #{exp}")
        expect(service.call(lat, lng, sig, nil)).to be(false)
        expect(service.call(lat, lng, sig, "")).to be(false)
      end

      it "expires_at が期限切れなら false を返す" do
        exp = (now - 60).to_i
        sig = OpenSSL::HMAC.hexdigest("SHA256", secret, "#{lat}, #{lng}, #{exp}")
        expect(service.call(lat, lng, sig, exp)).to be(false)
      end

      it "expires_at が将来時刻かつ正しい署名なら true を返す" do
        exp = (now + 300).to_i
        sig = OpenSSL::HMAC.hexdigest("SHA256", secret, "#{lat}, #{lng}, #{exp}")

        expect(service.call(lat, lng, sig, exp)).to be(true)
      end

      it "署名の長さが異なると false を返す" do
        exp = (now + 300).to_i
        sig = OpenSSL::HMAC.hexdigest("SHA256", secret, "#{lat}, #{lng}, #{exp}")

        expect(service.call(lat, lng, sig[0..2], exp)).to be(false)
      end
    end
  end
end
