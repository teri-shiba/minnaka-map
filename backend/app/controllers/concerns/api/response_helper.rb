module Api
  module ResponseHelper
    def render_success(data: nil, meta: nil, status: :ok)
      payload = { success: true }
      payload[:data] = data if data
      payload[:meta] = meta if meta
      render json: payload, status: status
    end

    def render_error(message, details: nil, status: :unprocessable_entity)
      payload = { success: false, error: { message: message } }
      payload[:error][:details] = details if details
      render json: payload, status: status
    end
  end
end
