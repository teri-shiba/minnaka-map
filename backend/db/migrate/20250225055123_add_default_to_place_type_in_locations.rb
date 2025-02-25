class AddDefaultToPlaceTypeInLocations < ActiveRecord::Migration[7.2]
  def change
    change_column_default :locations, :place_type, from: nil, to: "address"
  end
end
