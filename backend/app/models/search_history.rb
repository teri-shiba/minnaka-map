class SearchHistory < ApplicationRecord
  belongs_to :user
  has_many :search_history_start_stations, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :start_stations, through: :search_history_start_stations, source: :station
  has_many :shared_favorite_lists, dependent: :destroy

  def station_names
    if association(:start_stations).loaded?
      start_stations.map(&:name).sort
    else
      start_stations.order(:name).pluck(:name)
    end
  end
end
