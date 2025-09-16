module ApiResponseHelpers
  # --- basic ---
  def json
    JSON.parse(response.body, symbolize_names: true)
  end

  def data = json.fetch(:data)
  def meta = json.fetch(:meta)
  def error = json.fetch(:error)

  # --- success ---
  def expect_success_json!(data: nil, status: :ok)
    expect(response).to have_http_status(status)
    expect(json[:success]).to be(true)
    expect(json[:data]).to eq(data) unless data.nil?
  end

  def expect_status_ok! = expect_success_json!(status: :ok)
  def expect_status_created! = expect_success_json!(status: :created)

  # --- error ---
  def expect_error_json!(status:, message: nil, details: nil)
    expect(response).to have_http_status(status)
    payload = json

    if payload.has_key?(:error)
      assert_wrapper_error!(payload, message, details)
    elsif payload.has_key?(:errors)
      assert_dta_error!(payload, message)
    end
  end

  def expect_bad_request_json!(message: nil, details: nil)
    expect_error_json!(status: :bad_request, message:, details:)
  end

  def expect_unprocessable_json!(message: nil, details: nil)
    expect_error_json!(status: :unprocessable_entity, message:, details:)
  end

  def expect_not_found_json!(message: nil, details: nil)
    expect_error_json!(status: :not_found, message:, details:)
  end

  def expect_unauthorized_json!(message: "ログインもしくはアカウント登録してください")
    expect_error_json!(status: :unauthorized, message:)
  end

  private

    def assert_wrapper_error!(payload, message, details)
      expect(payload[:success]).to be(false) if payload.has_key?(:success)
      expect(payload.dig(:error, :message)).to eq(message) if message
      expect(payload.dig(:error, :details)).to eq(details) if details
    end

    def assert_dta_error!(payload, message)
      return unless message

      errors = payload[:errors]

      if errors.is_a?(Array)
        expect(errors).to include(message)
      else
        expect(errors).to eq(message)
      end
    end
end
