FactoryBot.define do
  factory :search_history_start_station do
    association :search_history
    association :station
  end
end
