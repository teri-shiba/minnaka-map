class Location < ApplicationRecord
  belongs_to :prefecture
  has_one :station
  has_many :search_history_start_locations
  has_many :search_history_center_locations
end
