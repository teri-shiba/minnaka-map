class SharedFavoriteListCreateSerializer < ActiveModel::Serializer
  attributes :share_uuid, :title
  attribute :existing?, key: :is_existing

  def existing?
    instance_options[:is_existing]
  end
end
