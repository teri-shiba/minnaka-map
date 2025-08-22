# frozen_string_literal: true

module Api
  module ResponseHelper
    def render_success(data: nil, status: :ok)
      payload = { success: true }
      payload[:data] = data if data
      render json: payload, status: status
    end

    def render_error(message, status = :unprocessable_entity, details: nil)
      payload = {
        success: false,
        error: {
          message: message,
        },
      }
      payload[:error][:details] = details if details
      render json: payload, status: status
    end
  end
end
