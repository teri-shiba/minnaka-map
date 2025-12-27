class Api::V1::Overrides::ConfirmationsController < DeviseTokenAuth::ConfirmationsController
  def show
    @resource = resource_class.confirm_by_token(resource_params[:confirmation_token])

    redirect_url = get_redirect_url

    if @resource.errors.empty?
      redirect_to DeviseTokenAuth::Url.generate(
        redirect_url,
        success: "email_confirmed",
      )
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
      )
    end
  end

  private

    def get_redirect_url
      url = params[:redirect_url]
      return nil if url.blank?
      return nil unless DeviseTokenAuth::Url.whitelisted?(url)

      url
    end
end
