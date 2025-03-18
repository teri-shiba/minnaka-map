class RenameLocationIdToStationId < ActiveRecord::Migration[7.2]
  def change
    add_reference :search_history_center_locations, :station, foreign_key: true, null: false
    add_reference :search_history_start_locations, :station, foreign_key: true, null: false
  end
end
