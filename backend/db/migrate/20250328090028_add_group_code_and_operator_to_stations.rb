class AddGroupCodeAndOperatorToStations < ActiveRecord::Migration[7.2]
  def change
    add_column :stations, :group_code, :string, null: false
    add_reference :stations, :operator, null: false, foreign_key: true, null: true
    add_index :stations, [:name, :group_code], unique: true
  end
end
