class RenameSearchHistoryTables < ActiveRecord::Migration[7.2]
  def change
    rename_table :search_history_center_locations, :search_history_center_stations
    rename_table :search_history_start_locations, :search_history_start_stations
  end
end
