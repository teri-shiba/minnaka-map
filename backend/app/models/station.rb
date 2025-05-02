class Station < ApplicationRecord
  belongs_to :operator

  validates :name, presence: true
  validates :latitude, presence: true
  validates :longitude, presence: true

  scope :search_by_name, ->(query) {
    where("name ILIKE :q OR name_hiragana ILIKE :q OR name_romaji ILIKE :q", q: "#{query}%").
      order(
        Arel.sql("CASE WHEN name = '#{ActiveRecord::Base.connection.quote_string(query)}' THEN 0 ELSE 1 END"),
        Arel.sql("LENGTH(name) ASC"),
      )
  }

  def display_name
    if operator.present?
      "#{name}（#{operator.alias_name}）"
    else
      name
    end
  end
end
