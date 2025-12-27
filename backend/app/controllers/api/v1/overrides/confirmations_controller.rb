class Api::V1::Overrides::ConfirmationsController < DeviseTokenAuth::ConfirmationsController
  def show
    @resource = resource_class.confirm_by_token(resource_params[:confirmation_token])

    redirect_url = self.redirect_url

    if @resource.errors.empty?
      redirect_to DeviseTokenAuth::Url.generate(
        redirect_url,
        success: "email_confirmed",
      ), allow_other_host: true
    else

      email_errors = @resource.errors.details[:email] || []

      error_code =
        if email_errors.any? {|e| e[:error] == :already_confirmed }
          "already_confirmed"
        else
          "request_failed"
        end

      redirect_to DeviseTokenAuth::Url.generate(
        redirect_url,
        error: error_code,
      ), allow_other_host: true
    end
  end
end
