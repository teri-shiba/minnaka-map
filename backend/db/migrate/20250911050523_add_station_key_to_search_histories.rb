class AddStationKeyToSearchHistories < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  def up
    add_column :search_histories, :station_key, :string

    add_index :search_histories,
              [:user_id, :station_key],
              unique: true,
              name: "index_search_histories_on_user_id_and_station_key",
              algorithm: :concurrently
  end

  def down
    remove_index :search_histories, name: "index_search_histories_on_user_id_and_station_key"
    remove_column :search_histories, :station_key
  end
end
