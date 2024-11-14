FactoryBot.define do
  factory :user_auth do
    name { "田中太郎" }
    sequence(:email) {|n| "#{n}_test@example.com" }
    password { "password" }
    confirmed_at { Time.current }
  end
end
