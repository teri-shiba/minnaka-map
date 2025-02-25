class CreateSearchHistoryStartLocations < ActiveRecord::Migration[7.2]
  def change
    create_table :search_history_start_locations do |t|
      t.references :location, null: false, foreign_key: true
      t.references :search_history, null: false, foreign_key: true

      t.timestamps
    end
  end
end
