FactoryBot.define do
  factory :user_auth do
    name { Faker::Name.name }
    sequence(:email) {|n| "#{n}_" + Faker::Internet.email }
    password { Faker::Internet.password(min_length: 10) }
    confirmed_at { Time.current }
  end
end
