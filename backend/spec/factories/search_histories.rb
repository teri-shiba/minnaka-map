FactoryBot.define do
  factory :search_history do
    association :user

    trait :with_start_stations do
      transient do
        station_keys { [] }
      end

      after(:create) do |search_history, evaluator|
        evaluator.station_keys.each do |key|
          station = create(:station, station_key: key)
          create(:search_history_start_station, search_history:, station:)
        end
      end
    end

    trait :with_favorites do
      transient do
        favorites_count { 2 }
        hotpepper_ids   { [] }
      end

      after(:create) do |search_history, evaluator|
        if evaluator.hotpepper_ids.any?
          evaluator.hotpepper_ids.each do |hp|
            create(:favorite,
                   user: search_history.user,
                   search_history: search_history,
                   hotpepper_id: hp)
          end
        else
          create_list(:favorite,
                      evaluator.favorites_count,
                      user: search_history.user,
                      search_history: search_history)
        end
      end
    end
  end
end
