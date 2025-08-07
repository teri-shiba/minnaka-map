class SearchHistory < ApplicationRecord
  belongs_to :user
  has_many :search_history_start_stations, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :start_stations, through: :search_history_start_stations, source: :station

  def station_names
    start_stations.pluck(:name)
  end
end
