class SearchHistoryStartLocation < ApplicationRecord
  belongs_to :location
  belongs_to :search_history
end
