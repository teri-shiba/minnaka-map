FactoryBot.define do
  factory :favorite do
    association :user
    association :search_history
    hotpepper_id { SecureRandom.alphanumeric(10) }
  end
end
