class Api::V1::Auth::SessionsController < DeviseTokenAuth::SessionsController
  def destroy
    super
    reset_session
  end
end
