class Api::V1::User::ConfirmationsController < Api::V1::BaseController
  def update
    user = UserAuth.find_by(confirmation_token: params[:confirmation_token])

    if user.nil?
      message = I18n.t("activerecord.models.user") + I18n.t("errors.messages.not_found")
      return render json: { message: }, status: :not_found
    end

    if user.confirmed?
      message = I18n.t("activerecord.attributes.user_auth.email") + I18n.t("errors.messages.already_confirmed")
      return render json: { message: }, status: :bad_request
    end

    user.update!(confirmed_at: Time.current)
    render json: { message: I18n.t("devise.confirmations.confirmed") }, status: :ok
  end
end
