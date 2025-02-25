class AddNotNullConstraintsToStations < ActiveRecord::Migration[7.2]
  def change
    change_column_null :stations, :name, false
  end
end
