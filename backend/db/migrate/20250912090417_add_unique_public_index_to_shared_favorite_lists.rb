class AddUniquePublicIndexToSharedFavoriteLists < ActiveRecord::Migration[7.2]
  def change
    add_index :shared_favorite_lists,
              [:user_id, :search_history_id],
              unique: true,
              where: "is_public = true",
              name: "idx_unique_public_shared_list_per_user_history"
  end
end
