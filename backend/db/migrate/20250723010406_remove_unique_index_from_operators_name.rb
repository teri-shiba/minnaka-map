class RemoveUniqueIndexFromOperatorsName < ActiveRecord::Migration[7.2]
  def change
    remove_index :operators, :name
    add_index :operators, :name
  end
end
