class AddNotNullConstraintsToLocations < ActiveRecord::Migration[7.2]
  def change
    change_column_null :locations, :place_id, false
    change_column_null :locations, :latitude, false
    change_column_null :locations, :longitude, false
    change_column_null :locations, :locality, false
    change_column_null :locations, :sublocality, false
    change_column_null :locations, :place_type, false
    change_column_null :locations, :prefecture_id, false
  end
end
