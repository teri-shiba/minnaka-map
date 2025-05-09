class AddNotNullConstraintsToOperator < ActiveRecord::Migration[7.2]
  def change
    change_column_null :operators, :name, false
    change_column_null :operators, :alias_name, false
  end
end
