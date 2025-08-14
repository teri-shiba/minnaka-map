class FixSharedFavoriteListsUuidDefault < ActiveRecord::Migration[7.2]
  def up
    change_column_default :shared_favorite_lists, :share_uuid, nil
    change_column_default :shared_favorite_lists, :share_uuid, "uuid_generate_v4()"
  end

  def down
    change_column_default :shared_favorite_lists, :share_uuid, -> { 'uuid_generate_v4()' }
  end
end
