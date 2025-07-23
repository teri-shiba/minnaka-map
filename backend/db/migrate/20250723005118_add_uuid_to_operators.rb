class AddUuidToOperators < ActiveRecord::Migration[7.2]
  def change
    add_column :operators, :uuid, :uuid

    reversible do |dir|
      dir.up do
        Operator.reset_column_information
        Operator.find_each do |operator|
          operator.update!(uuid: SecureRandom.uuid)
        end
      end
    end

    add_index :operators, :uuid, unique: true
  end
end
