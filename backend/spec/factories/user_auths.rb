FactoryBot.define do
  factory :user_auth do
    association :user

    provider { "email" }
    sequence(:email) {|n| "#{n}_" + Faker::Internet.email }
    uid { email }
    password { Faker::Internet.password(min_length: 8) }
    confirmed_at { Time.current }

    trait :unconfirmed do
      confirmed_at { nil }
      confirmation_token { SecureRandom.hex(10) }
      confirmation_sent_at { Time.current }
    end

    trait :confirmed do
      confirmed_at { Time.current }
      confirmation_token { SecureRandom.hex(10) }
      confirmation_sent_at { 1.day.ago }
    end

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
