class UserAuth < ApplicationRecord
  include DeviseTokenAuth::Concerns::User
  # Include default devise modules. Others available are:
  # :lockable, :timeoutable, :trackable
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :validatable,
         :confirmable,
         :omniauthable, omniauth_providers: [:google_oauth2, :line]

  belongs_to :user, optional: true

  def self.add_permitted_params
    [:name]
  end
end
