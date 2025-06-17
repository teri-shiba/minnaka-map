FactoryBot.define do
  factory :location do
    place_id { "MyString" }
    latitude { "9.99" }
    longitude { "9.99" }
    locality { "MyString" }
    sublocality { "MyString" }
    place_type { "MyString" }
    prefecture { nil }
  end
end
