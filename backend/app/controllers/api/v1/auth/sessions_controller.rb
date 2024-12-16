class Api::V1::Auth::SessionsController < DeviseTokenAuth::SessionsController
  def destroy
    super
    reset_session
    request.session_options[:skip] = true
    cookies.delete(:_session_id)
  end
end