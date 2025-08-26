class CurrentUserSerializer < ActiveModel::Serializer
  attributes :id, :email, :name, :provider

  def id
    object.user.id
  end

  def email
    object.email
  end

  def name
    object.user&.name
  end

  def provider
    object.provider
  end
end
