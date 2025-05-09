class DropPrefecturesTable < ActiveRecord::Migration[7.2]
  def change
    drop_table :prefectures
  end
end
