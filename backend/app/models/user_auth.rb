class UserAuth < ApplicationRecord
  include DeviseTokenAuth::Concerns::User
  belongs_to :user
  after_destroy :destroy_user_if_no_auths

  # Include default devise modules. Others available are:
  # :lockable, :timeoutable, :trackable
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :validatable,
         :confirmable,
         :omniauthable, omniauth_providers: [:google_oauth2, :line]

  def self.add_permitted_params
    [:name]
  end

  private

    def destroy_user_if_no_auths
      user.destroy! if user.user_auths.empty?
    end
end
