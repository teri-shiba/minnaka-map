class SearchHistoryCenterStation < ApplicationRecord
  belongs_to :search_history
  belongs_to :station
end
