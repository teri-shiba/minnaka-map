class Location < ApplicationRecord
  belongs_to :prefecture
  has_one :station, dependent: :destroy
  has_many :search_history_start_locations, dependent: :destroy
  has_many :search_history_center_locations, dependent: :destroy
end
