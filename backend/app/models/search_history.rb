class SearchHistory < ApplicationRecord
  belongs_to :user
  has_many :search_history_start_locations, dependent: :destroy
  has_one :search_history_center_location, dependent: :destroy
end
