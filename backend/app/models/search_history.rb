class SearchHistory < ApplicationRecord
  belongs_to :user
  has_many :search_history_start_stations, dependent: :destroy
  has_one :search_history_center_stations, dependent: :destroy
end
