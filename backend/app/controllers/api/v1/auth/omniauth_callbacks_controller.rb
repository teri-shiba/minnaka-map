class Api::V1::Auth::OmniauthCallbacksController < DeviseTokenAuth::OmniauthCallbacksController
  def omniauth_success
    logger.debug "OmniAuth Auth Hash (LINE): #{auth_hash.inspect}"
    return if prevent_duplicate_email_redirect

    resource_from_auth_hash
    set_token_on_resource
    create_auth_params

    if confirmable_enabled?
      @resource.skip_confirmation!
    end

    sign_in(:user, @resource, store: false, bypass: false)

    @resource.save!

    yield @resource if block_given?

    if DeviseTokenAuth.cookie_enabled
      set_token_in_cookie(@resource, @token)
    end

    redirect_to "#{Settings.front_domain}/?status=success"
  end

  def omniauth_failure
    redirect_to "#{Settings.front_domain}/?status=error"
  end

  private

    def prevent_duplicate_email_redirect
      email = auth_hash["info"]["email"]
      provider = auth_hash["provider"]
      uid = auth_hash["uid"]

      return false unless email && provider && uid

      is_new_sns_user = !resource_class.exists?(provider: provider, uid: uid)

      email_exists = resource_class.exists?(email: email)

      if is_new_sns_user && email_exists
        error_message = "このメールアドレスは既に登録されています。"
        redirect_to "#{Settings.front_domain}/?status=error&message=#{CGI.escape(error_message)}"
        return true
      end
      false
    end

    def resource_from_auth_hash
      @resource = resource_class.where(
        uid: auth_hash["uid"],
        provider: auth_hash["provider"],
      ).first_or_initialize

      if @resource.new_record?
        @oauth_registration = true

        user = User.new(name: auth_hash["info"]["name"])
        user.save!
        @resource.user = user

        @resource = UserAuth.new(
          provider: auth_hash["provider"],
          uid: auth_hash["uid"],
          email: auth_hash["info"]["email"],
          password: set_random_password,
          user: user,
        )
      end

      assign_provider_attrs(@resource, auth_hash)

      @resource
    end
end
