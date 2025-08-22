FactoryBot.define do
  factory :shared_favorite_list do
    association :user
    search_history { association :search_history, user: }

    title { "新宿・渋谷" }

    trait(:public) { is_public { true } }
    trait(:private) { is_public { false } }
  end
end
