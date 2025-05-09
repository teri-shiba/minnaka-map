class AddLatLongToStations < ActiveRecord::Migration[7.2]
  def change
    add_column :stations, :latitude, :decimal, precision: 10, scale: 5, null: false
    add_column :stations, :longitude, :decimal, precision: 10, scale: 5, null: false
  end
end
