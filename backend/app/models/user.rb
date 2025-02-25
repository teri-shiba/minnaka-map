class User < ApplicationRecord
  has_many :user_auth, dependent: :destroy
  has_many :search_histories, dependent: :destroy
end
