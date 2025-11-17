class Api::V1::Auth::OmniauthCallbacksController < DeviseTokenAuth::OmniauthCallbacksController
  def omniauth_success
    return if prevent_duplicate_email_redirect

    resource_from_auth_hash
    set_token_on_resource
    create_auth_params

    @resource.skip_confirmation! if confirmable_enabled?

    @resource.save!

    sign_in(resource_name, @resource, store: false, bypass: false)

    yield @resource if block_given?

    set_token_in_cookie(@resource, @token) if DeviseTokenAuth.cookie_enabled

    redirect_to "#{Settings.front_domain}/?success=login", allow_other_host: true
  end

  def omniauth_failure
    redirect_to "#{Settings.front_domain}/?error=network_error", allow_other_host: true
  end

  private

    def resource_class = UserAuth
    def resource_name = :user_auth

    def prevent_duplicate_email_redirect
      email = auth_hash.dig("info", "email")
      provider = auth_hash["provider"]
      uid = auth_hash["uid"]

      return false unless email && provider && uid

      new_sns_user = !resource_class.exists?(provider: provider, uid: uid)

      email_exists = resource_class.exists?(email: email)

      if new_sns_user && email_exists
        redirect_to "#{Settings.front_domain}/?error=duplicate_email", allow_other_host: true
        return true
      end
      false
    end

    def resource_from_auth_hash
      @resource = resource_class.find_or_initialize_by(
        uid: auth_hash["uid"],
        provider: auth_hash["provider"],
      )

      if @resource.new_record?
        @oauth_registration = true
        user = User.create!(name: auth_hash.dig("info", "name") || "unknown")
        @resource.assign_attributes(
          email: auth_hash.dig("info", "email"),
          password: set_random_password,
          user: user,
        )
      end

      assign_provider_attrs(@resource, auth_hash)
      @resource
    end
end
