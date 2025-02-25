class CreateStations < ActiveRecord::Migration[7.2]
  def change
    create_table :stations do |t|
      t.string :name
      t.references :location, null: false, foreign_key: true

      t.timestamps
    end
  end
end
