class DropSearchHistoryCenterStationsTable < ActiveRecord::Migration[7.2]
  def up
    drop_table :search_history_center_stations, if_exists: true
  end

  def down
    create_table :search_history_center_stations do |t|
      t.bigint :search_history_id, null: false
      t.bigint :station_id, null: false
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end

    add_index :search_history_center_stations,
              :search_history_id,
              name: "index_search_history_center_stations_on_search_history_id"
    add_index :search_history_center_stations,
              :station_id,
              name: "index_search_history_center_stations_on_station_id"
  end
end
