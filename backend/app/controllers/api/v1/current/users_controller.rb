class Api::V1::Current::UsersController < Api::V1::BaseController
  before_action :authenticate_user!, except: [:show_status]

  def show
    render json: current_user, serializer: CurrentUserSerializer
  end

  def show_status
    if current_user
      render json: current_user, serializer: CurrentUserSerializer
    else
      render json: { "login": false }, status: :ok
    end
  end
end
