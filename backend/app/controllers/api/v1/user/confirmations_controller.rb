class Api::V1::User::ConfirmationsController < Api::V1::BaseController
  def update
    user = UserAuth.find_by(confirmation_token: params[:confirmation_token])

    if user.nil?
      return render json: { error: "invalid_token" }, status: :not_found
    end

    if user.confirmed?
      return render json: { error: "already_confirmed" }, status: :bad_request
    end

    user.update!(confirmed_at: Time.current)
    render json: { success: true }, status: :ok
  end
end
