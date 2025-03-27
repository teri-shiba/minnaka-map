class AddReadingColumnsToStations < ActiveRecord::Migration[7.2]
  def change
    add_column :stations, :name_hiragana, :string
    add_column :stations, :name_romaji, :string

    add_index :stations, :name
    add_index :stations, :name_hiragana
    add_index :stations, :name_romaji
  end
end
