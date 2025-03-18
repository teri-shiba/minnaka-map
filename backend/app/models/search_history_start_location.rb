class SearchHistoryStartStation < ApplicationRecord
  belongs_to :station
  belongs_to :search_history
end
