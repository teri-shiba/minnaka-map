FactoryBot.define do
  factory :station do
    uuid { SecureRandom.uuid }

    transient do
      station_data_list { StationTestData::STATIONS.values }
    end

    sequence(:group_code) {|n| "GRP#{n}" }
    association :operator

    after(:build) do |station, evaluator|
      unless station.name_changed?
        station_data = evaluator.station_data_list.sample
        station.name = station_data[:name]
        station.name_hiragana = station_data[:name_hiragana]
        station.name_romaji = station_data[:name_romaji]
        station.latitude = station_data[:latitude]
        station.longitude = station_data[:longitude]
      end
    end
  end
end
