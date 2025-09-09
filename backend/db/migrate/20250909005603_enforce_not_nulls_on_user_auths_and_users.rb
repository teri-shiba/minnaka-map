class EnforceNotNullsOnUserAuthsAndUsers < ActiveRecord::Migration[7.2]
  def up
    ua_nulls = select_value("SELECT COUNT(*) FROM user_auths WHERE user_id IS NULL").to_i
    if ua_nulls.positive?
      raise "user_auths.user_id に NULL が #{ua_nulls} 件あります。先にデータを修正してから再実行してください。"
    end

    user_name_nulls = select_value("SELECT COUNT(*) FROM users WHERE name IS NULL").to_i
    if user_name_nulls.positive?
      raise "users.name に NULL が #{user_name_nulls} 件あります。先にデータを修正してから再実行してください。"
    end
    
    change_column_null :user_auths, :user_id, false
    change_column_null :users, :name, false
  end

  def down
    change_column_null :user_auths, :user_id, true
    change_column_null :users, :name, true
  end
end
