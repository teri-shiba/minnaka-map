class Api::V1::Overrides::RegistrationsController < DeviseTokenAuth::RegistrationsController
  include Api::ResponseHelperWrapper

  def create
    if sign_up_params[:name].blank?
      render_api_error("Name can't be blank", status: :unprocessable_entity)
      return
    end

    normalized = normalized_email(sign_up_params[:email])
    if UserAuth.exists?(email: normalized)
      render json: { error: "duplicate_email" }, status: :unprocessable_entity
      return
    end

    super
  end

  def destroy
    super
    reset_session
    cookies.delete(DeviseTokenAuth.cookie_name, domain: DeviseTokenAuth.cookie_attributes[:domain])
  end

  def build_resource
    auth_params = sign_up_params.except(:name)
    @resource = resource_class.new(auth_params)
    @resource.provider = provider
    @resource.email = normalized_email(auth_params[:email])
    @resource.build_user(name: sign_up_params[:name])
  end

  private

    def sign_up_params
      params.permit(:email, :password, :password_confirmation, :name)
    end

    # Devise/モデル側の case_insensitive_keys に合わせる
    def normalized_email(raw)
      return raw if raw.nil?

      if resource_class.case_insensitive_keys.include?(:email)
        raw.to_s.downcase
      else
        raw
      end
    end
end
