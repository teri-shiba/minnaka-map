FactoryBot.define do
  factory :favorite do
    association :user
    association :search_history
    sequence(:hotpepper_id) {|n| "HP-#{n}" }
  end
end
