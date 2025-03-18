class DropLocationsTable < ActiveRecord::Migration[7.2]
  def change
    remove_foreign_key :stations, :locations
    remove_foreign_key :search_history_start_locations, :locations
    remove_foreign_key :search_history_center_locations, :locations

    remove_column :stations, :location_id
    remove_column :search_history_start_locations, :location_id
    remove_column :search_history_center_locations, :location_id

    drop_table :locations
  end
end
