class Api::V1::TestHelpersController < ApplicationController
  before_action :verify_test_environment

  def verification_email
    service = GmailService.new
    link = service.get_verification_email(
      params[:email],
      timeout_seconds: params[:timeout]&.to_i || 60,
    )

    if link
      render json: { verification_link: link }
    else
      render json: { error: "メールが見つかりませんでした" }, status: :not_found
    end
  end

  private

    def verify_test_environment
      return if Rails.env.test? || Rails.env.development?

      head :forbidden
    end
end
