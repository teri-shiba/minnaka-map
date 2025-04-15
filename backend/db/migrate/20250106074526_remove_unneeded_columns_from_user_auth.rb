class RemoveUnneededColumnsFromUserAuth < ActiveRecord::Migration[7.2]
  def change
    remove_column :user_auths, :name
    remove_column :user_auths, :nickname
    remove_column :user_auths, :image
  end
end
