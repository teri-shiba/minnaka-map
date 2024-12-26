ActiveRecord::Base.transaction do
  UserAuth.create!(name: "テスト太郎", email: "test1@example.com", password: "lGP$AC354353K@hFcT,I", confirmed_at: Time.current)
end
