class AddUniqueIndexToSearchHistoryStartStations < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  def up
    add_index :search_history_start_stations,
              [:search_history_id, :station_id],
              unique: true,
              algorithm: :concurrently,
              name: 'index_shss_on_history_id_and_station_id_unique'
  end

  def down
    remove_index :search_history_start_stations,
                 name: 'index_shss_on_history_id_and_station_id_unique'
  end
end
