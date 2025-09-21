FactoryBot.define do
  factory :station do
    uuid { SecureRandom.uuid }

    transient do
      station_data_list { StationTestData::STATIONS.values }
      station_key { nil }
    end

    sequence(:group_code) {|n| "GRP#{n}" }
    association :operator

    after(:build) do |station, evaluator|
      data =
        if evaluator.station_key
          StationTestData::STATIONS.fetch(evaluator.station_key)
        elsif station.name.present?
          evaluator.station_data_list.find {|d| d[:name] == station.name } || evaluator.station_data_list.sample
        else
          evaluator.station_data_list.sample
        end

      station.name          ||= data[:name]
      station.name_hiragana ||= data[:name_hiragana]
      station.name_romaji   ||= data[:name_romaji]
      station.latitude      ||= data[:latitude]
      station.longitude     ||= data[:longitude]
    end
  end
end
