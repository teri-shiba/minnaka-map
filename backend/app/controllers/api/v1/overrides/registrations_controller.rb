class Api::V1::Overrides::RegistrationsController < DeviseTokenAuth::RegistrationsController
  def build_resource
    super
    user = User.create!(name: sign_up_params[:name])
    @resource.user_id = user.id
  end

  def create
    super
  end

  private

  def sign_up_params
    params.permit(:email, :password, :password_confirmation, :user_id)
  end
end
