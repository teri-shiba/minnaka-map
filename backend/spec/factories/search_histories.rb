FactoryBot.define do
  factory :search_history do
    association :user
    sequence(:station_key) { "tmp-#{SecureRandom.uuid}" }

    trait :with_start_stations do
      transient do
        station_keys { [] }
        stations     { [] }
        station_ids  { [] }
      end

      after(:build) do |search_history, evaluator|
        selected =
          if evaluator.stations.present?
            evaluator.stations
          elsif evaluator.station_ids.present?
            Station.where(id: evaluator.station_ids).to_a
          elsif evaluator.station_keys.present?
            evaluator.station_keys.map {|key| create(:station, station_key: key) }
          else
            []
          end

        search_history.instance_variable_set(:@_selected_stations, selected)
        if selected.any?
          search_history.station_key = selected.map(&:id).uniq.sort.join("-")
        end
      end

      after(:create) do |search_history, _evaluator|
        (search_history.instance_variable_get(:@_selected_stations) || []).each do |st|
          create(:search_history_start_station, search_history:, station: st)
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
