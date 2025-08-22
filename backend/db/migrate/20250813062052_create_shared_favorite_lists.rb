class CreateSharedFavoriteLists < ActiveRecord::Migration[7.2]
  def change
    create_table :shared_favorite_lists do |t|
      t.references :user, null: false, foreign_key: true
      t.references :search_history, null: false, foreign_key: true
      t.string :title, null: false
      t.uuid :share_uuid, null: false, default: -> { 'uuid_generate_v4()' }
      t.boolean :is_public, null: false, default: true

      t.timestamps null: false
    end

    add_index :shared_favorite_lists, :share_uuid, unique: true
    add_index :shared_favorite_lists, [:user_id, :created_at]
    add_index :shared_favorite_lists, [:is_public, :created_at]
  end
end