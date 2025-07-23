class AddUuidToStations < ActiveRecord::Migration[7.2]
  def change
    enable_extension "uuid-ossp" unless extension_enabled?("uuid-ossp")
    add_column :stations, :uuid, :uuid, default: "uuid_generate_v4()", null: false
    add_index :stations, :uuid, unique: true
  end
end
