FactoryBot.define do
  factory :operator do
    uuid { SecureRandom.uuid }
    sequence(:name) {|n| "運営会社#{n}" }
    sequence(:alias_name) {|n| "運営#{n}" }
  end
end
