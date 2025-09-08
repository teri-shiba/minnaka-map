class Api::V1::Overrides::RegistrationsController < DeviseTokenAuth::RegistrationsController
  include Api::ResponseHelperWrapper

  def create
    if sign_up_params[:name].blank?
      render_api_error("Name can't be blank", status: :unprocessable_entity)
      return
    end
    super
  end

  def build_resource
    auth_params = sign_up_params.except(:name)

    @resource = resource_class.new(auth_params)
    @resource.provider = provider
    @resource.email =
      if resource_class.case_insensitive_keys.include?(:email)
        auth_params[:email].to_s.downcase
      else
        auth_params[:email]
      end
    @resource.build_user(name: sign_up_params[:name])
  end

  private

    def sign_up_params
      params.permit(:email, :password, :password_confirmation, :name)
    end
end
