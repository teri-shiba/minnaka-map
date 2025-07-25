class User < ApplicationRecord
  has_many :user_auth, dependent: :destroy
  has_many :search_histories, dependent: :destroy
  has_many :favorites, dependent: :destroy

  validates :name, presence: true

  def favorites_by_search_history
    favorites.includes(:search_history).joins(:search_history).group_by(&:search_history)
  end
end
