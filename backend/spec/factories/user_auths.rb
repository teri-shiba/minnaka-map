FactoryBot.define do
  factory :user_auth do
    association :user

    provider { "email" }
    sequence(:email) {|n| "#{n}_" + Faker::Internet.email }
    uid { email }
    password { Faker::Internet.password(min_length: 8) }
    confirmed_at { Time.current }

    trait :google do
      provider { "google_oauth2" }
      uid { SecureRandom.uuid }
    end

    trait :line do
      provider { "line" }
      uid { SecureRandom.uuid }
    end
  end
end
