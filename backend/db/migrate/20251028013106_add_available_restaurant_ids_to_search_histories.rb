class AddAvailableRestaurantIdsToSearchHistories < ActiveRecord::Migration[7.2]
  def change
    add_column :search_histories, :available_restaurant_ids, :text, array: true, default: []
    add_index :search_histories, :available_restaurant_ids, using: :gin
  end
end
