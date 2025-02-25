class Location < ApplicationRecord
  belongs_to :prefecture
  has_one :station
end
