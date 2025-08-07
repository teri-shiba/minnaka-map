class CreateFavorites < ActiveRecord::Migration[7.2]
  def change
    create_table :favorites do |t|
      t.references :user, null: false, foreign_key: true
      t.references :search_history, null: false, foreign_key: true
      t.string :hotpepper_id, null: false

      t.timestamps
    end

    add_index :favorites, [:user_id, :search_history_id, :hotpepper_id],
              unique: true,
              name: "index_favorites_unique"

    add_index :favorites, [:user_id, :created_at],
              name: "index_favorites_on_user_created_at"
  end
end
