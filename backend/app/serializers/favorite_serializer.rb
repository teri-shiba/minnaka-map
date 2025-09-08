class FavoriteSerializer < ActiveModel::Serializer
  attributes :id, :search_history_id, :user_id, :hotpepper_id, :created_at, :updated_at

  def self.call(favorite)
    new(favorite).serializable_hash
  end
end
