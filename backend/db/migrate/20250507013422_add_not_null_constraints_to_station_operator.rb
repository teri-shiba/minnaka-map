class AddNotNullConstraintsToStationOperator < ActiveRecord::Migration[7.2]
  def change
    change_column_null :stations, :operator_id, false
  end
end
