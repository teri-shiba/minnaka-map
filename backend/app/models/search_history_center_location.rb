class SearchHistoryCenterLocation < ApplicationRecord
  belongs_to :search_history
  belongs_to :location
end
