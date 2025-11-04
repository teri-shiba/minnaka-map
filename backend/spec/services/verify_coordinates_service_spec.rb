require "rails_helper"

RSpec.describe VerifyCoordinatesService do
  describe "#call" do
    let!(:secret) { "test-secret" }
    let!(:lat_in)    { "35.6789" }
    let!(:lng_in)    { "139.1234" }
    let!(:now) { Time.zone.local(2025, 1, 1, 12, 0, 0) }
    let!(:service) do
      VerifyCoordinatesService.new(secret:, clock: -> { now })
    end

    it "署名が空なら false を返す" do
      lat = "%.5f" % lat_in.to_f
      lng = "%.5f" % lng_in.to_f
      exp = (now + 300).to_i

      expect(service.call(lat, lng, nil, exp)).to be(false)
      expect(service.call(lat, lng, "", exp)).to be(false)
    end

    it "期限が空なら false を返す" do
      lat = "%.5f" % lat_in.to_f
      lng = "%.5f" % lng_in.to_f
      exp = (now + 300).to_i
      sig = OpenSSL::HMAC.hexdigest("SHA256", secret, "#{lat}, #{lng}, #{exp}")

      expect(service.call(lat, lng, sig, nil)).to be(false)
      expect(service.call(lat, lng, sig, "")).to be(false)
    end

    it "期限切れなら false を返す" do
      lat = "%.5f" % lat_in.to_f
      lng = "%.5f" % lng_in.to_f
      exp = (now - 60).to_i
      sig = OpenSSL::HMAC.hexdigest("SHA256", secret, "#{lat}, #{lng}, #{exp}")

      expect(service.call(lat, lng, sig, exp)).to be(false)
    end

    it "期限が将来時刻かつ正しい署名なら true を返す" do
      lat = "%.5f" % lat_in.to_f
      lng = "%.5f" % lng_in.to_f
      exp = (now + 300).to_i
      sig = OpenSSL::HMAC.hexdigest("SHA256", secret, "#{lat}, #{lng}, #{exp}")

      expect(service.call(lat, lng, sig, exp)).to be(true)
    end

    it "署名の長さが異なると false を返す" do
      lat = "%.5f" % lat_in.to_f
      lng = "%.5f" % lng_in.to_f
      exp = (now + 300).to_i
      sig = OpenSSL::HMAC.hexdigest("SHA256", secret, "#{lat}, #{lng}, #{exp}")

      expect(service.call(lat, lng, sig[0..2], exp)).to be(false)
    end
  end
end
