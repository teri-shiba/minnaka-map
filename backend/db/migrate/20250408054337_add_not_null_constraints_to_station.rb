class AddNotNullConstraintsToStation < ActiveRecord::Migration[7.2]
  def change
    change_column_null :stations, :name_hiragana, false
    change_column_null :stations, :name_romaji, false
  end
end
