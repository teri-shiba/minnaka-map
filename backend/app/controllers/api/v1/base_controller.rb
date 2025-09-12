class Api::V1::BaseController < ApplicationController
  alias_method :current_user, :current_api_v1_user_auth
  alias_method :authenticate_user!, :authenticate_api_v1_user_auth!
  alias_method :user_signed_in?, :api_v1_user_auth_signed_in?

  private

    def current_app_user
      current_user.user
    end
end
