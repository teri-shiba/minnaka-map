class EnforceNotNullOnStationKey < ActiveRecord::Migration[7.2]
  def change
    change_column_null :search_histories, :station_key, false
  end
end
