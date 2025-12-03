namespace :e2e do
  desc "Setup test data for E2E tests"
  task setup: :environment do
    return unless Rails.env.test?

    puts "Creating E2E test data..."

    Rake::Task["e2e:teardown"].invoke

    operator = Operator.find_or_create_by!(alias_name: "E2E運営") do |o|
      o.name = "E2E運営"
      o.uuid = SecureRandom.uuid
    end

    test_stations = [
      {
        name: "渋谷",
        name_hiragana: "しぶや",
        name_romaji: "shibuya",
        latitude: 35.65885,
        longitude: 139.70171,
      },
      {
        name: "新宿",
        name_hiragana: "しんじゅく",
        name_romaji: "shinjuku",
        latitude: 35.68981,
        longitude: 139.70018,
      },
    ]

    test_stations.each do |attrs|
      Station.create!(
        name: attrs[:name],
        name_hiragana: attrs[:name_hiragana],
        name_romaji: attrs[:name_romaji],
        latitude: attrs[:latitude],
        longitude: attrs[:longitude],
        group_code: "E2E_TEST",
        operator: operator,
        uuid: SecureRandom.uuid,
      )
    end

    puts "E2E test data created: #{test_stations.size} stations"
  end

  desc "Clean up E2E test data"
  task teardown: :environment do
    return unless Rails.env.test?

    puts "🧹 Cleaning up E2E test data..."

    SearchHistory.joins(:start_stations).
      where(stations: { group_code: "E2E_TEST" }).
      destroy_all

    Station.where(group_code: "E2E_TEST").delete_all
    Operator.where(alias_name: "E2E運営").delete_all

    puts "E2E test data cleaned up"
  rescue => e
    puts "Cleanup warning: #{e.message}"
  end
end
