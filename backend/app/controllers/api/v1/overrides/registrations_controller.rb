class Api::V1::Overrides::RegistrationsController < DeviseTokenAuth::RegistrationsController
  def build_resource
    user_auth_params = sign_up_params.except(:name)

    @resource = resource_class.new(user_auth_params)
    @resource.provider = provider

    @resource.email = if resource_class.case_insensitive_keys.include?(:email)
                        user_auth_params[:email]&.downcase
                      else
                        user_auth_params[:email]
                      end

    user = User.create!(name: sign_up_params[:name])
    @resource.user_id = user.id
  end

  private

    def sign_up_params
      params.permit(:email, :password, :password_confirmation, :name, :user_id)
    end
end
