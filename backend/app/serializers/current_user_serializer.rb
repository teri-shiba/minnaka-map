class CurrentUserSerializer < ActiveModel::Serializer
  attributes :id, :email, :name

  def name
    object.user&.name
  end
end
