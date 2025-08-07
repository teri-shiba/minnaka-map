class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :search_history

  validates :hotpepper_id, presence: true

  scope :by_user, ->(user) { where(user: user) }
  scope :by_search_history, ->(search_history) { where(search_history: search_history) }
  scope :recent, -> { order(created_at: :desc) }
end
