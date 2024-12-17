class Api::V1::Current::UsersController < Api::V1::BaseController
  before_action :authenticate_user!, except: :show

  def show
    if current_user
      render json: {
        id: current_user.id,
        name: current_user.name,
        email: current_user.email,
        isSignedIn: true
      }, status: :ok
    else
      render json: {
        id: 0,
        name: '',
        email: '',
        isSignedIn: false
      }, status: :ok
    end
  end

end
