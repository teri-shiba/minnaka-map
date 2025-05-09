ActiveRecord::Base.transaction do
  user = User.create!(name: "テスト太郎")

  UserAuth.create!(
    email: "test1@example.com",
    password: "lGP$AC354353K@hFcT,I",
    confirmed_at: Time.current,
    user_id: user.id,
  )

  require_relative "../lib/tasks/import_stations"
  ImportStations.run
end
