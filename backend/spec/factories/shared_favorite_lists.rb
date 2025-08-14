FactoryBot.define do
  factory :shared_favorite_list do
    association :user
    association :search_history
    title { "新宿・渋谷" }
    is_public { true }

    trait :private do
      is_public { false }
    end
  end
end
