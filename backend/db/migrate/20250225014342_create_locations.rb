class CreateLocations < ActiveRecord::Migration[7.2]
  def change
    create_table :locations do |t|
      t.string :place_id
      t.decimal :latitude, precision: 10, scale: 5
      t.decimal :longitude, precision: 10, scale: 5
      t.string :locality
      t.string :sublocality
      t.string :place_type
      t.references :prefecture, null: false, foreign_key: true

      t.timestamps
    end
  end
end
