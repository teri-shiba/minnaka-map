class CurrentUserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email

  def name
    object.user&.name
  end
end
