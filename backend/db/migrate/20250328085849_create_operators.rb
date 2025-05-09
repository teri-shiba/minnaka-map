class CreateOperators < ActiveRecord::Migration[7.2]
  def change
    create_table :operators do |t|
      t.string :name
      t.string :alias_name

      t.timestamps
    end
    add_index :operators, :name, unique: true
  end
end
