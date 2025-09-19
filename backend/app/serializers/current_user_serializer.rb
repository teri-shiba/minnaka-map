class CurrentUserSerializer < ActiveModel::Serializer
  attributes :id, :email, :name, :provider

  def id
    object.respond_to?(:user_id) ? object.user_id : user&.id
  end

  def name
    user&.name
  end

  private

    def user
      @user ||= object.user
    end
end
