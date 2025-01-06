class User < ApplicationRecord
  has_many :user_auth, dependent: :destroy
end
