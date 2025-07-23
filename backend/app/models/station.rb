class Station < ApplicationRecord
  belongs_to :operator
  validates :name, presence: true
  validates :name_hiragana, presence: true
  validates :name_romaji, presence: true
  validates :latitude, presence: true
  validates :longitude, presence: true
  validates :group_code, presence: true
  validates :uuid, presence: true, uniqueness: true
  validates :name, uniqueness: { scope: :group_code, case_sensitive: false }

  scope :search_by_name, ->(query) {
    where("name ILIKE :q OR name_hiragana ILIKE :q OR name_romaji ILIKE :q", q: "#{query}%").
      order(
        Arel.sql("CASE WHEN name = '#{ActiveRecord::Base.connection.quote_string(query)}' THEN 0 ELSE 1 END"),
        Arel.sql("LENGTH(name) ASC"),
      )
  }

  def display_name
    "#{name}（#{operator.alias_name}）"
  end
end
