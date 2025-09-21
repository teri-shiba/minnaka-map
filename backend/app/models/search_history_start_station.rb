class SearchHistoryStartStation < ApplicationRecord
  belongs_to :station
  belongs_to :search_history

  validates :station_id, uniqueness: { scope: :search_history_id }
end
