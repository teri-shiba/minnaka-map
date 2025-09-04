class CurrentUserSerializer < ActiveModel::Serializer
  attributes :id, :email, :name, :provider

  def id
    object.respond_to?(:user_id) ? object.user_id : object.user&.id
  end

  def name
    object.user&.name
  end

  private

    def user
      @user ||= object.user
    end
end
