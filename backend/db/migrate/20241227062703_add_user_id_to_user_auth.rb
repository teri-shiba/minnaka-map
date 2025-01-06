class AddUserIdToUserAuth < ActiveRecord::Migration[7.2]
  def change
    add_reference :user_auths, :user, foreign_key: true
  end
end
