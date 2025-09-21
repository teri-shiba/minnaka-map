class User < ApplicationRecord
  has_many :user_auths, dependent: :destroy
  has_many :search_histories, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :shared_favorite_lists, dependent: :destroy

  validates :name, presence: true

  def favorites_by_search_history
    favorites.includes(search_history: :start_stations).
      joins(:search_history).
      order(created_at: :desc).
      group_by(&:search_history).
      sort_by {|_search_history, favorite| favorite.map(&:created_at).max }.
      reverse
  end
end
