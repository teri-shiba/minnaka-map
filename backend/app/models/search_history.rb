class SearchHistory < ApplicationRecord
  belongs_to :user
  has_many :search_history_start_stations, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :start_stations, through: :search_history_start_stations, source: :station

  has_one :search_history_center_stations, dependent: :destroy # 削除予定

  def station_names
    start_stations.pluck(:name)
  end
end
