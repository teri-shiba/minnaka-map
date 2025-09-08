# frozen_string_literal: true

module ApiResponseHelpers
  def json
    JSON.parse(response.body, symbolize_names: true)
  end

  def expect_success_json!(status: :ok, data: nil)
    expect(response).to have_http_status(status)
    expect(json[:success]).to be(true)
    expect(json[:data]).to eq(data) if data
  end

  def expect_unprocessable_json!(message: nil, details: nil)
    expect(response).to have_http_status(:unprocessable_entity)
    expect(json[:success]).to be(false)
    expect(json.dig(:error, :message)).to eq(message) if message
    expect(json.dig(:error, :details)).to eq(details) if details
  end

  def expect_bad_request_json!(message: nil, details: nil)
    expect(response).to have_http_status(:bad_request)
    expect(json[:success]).to be(false) if json.has_key?(:success)
    expect(json.dig(:error, :message)).to eq(message) if message && json.has_key?(:error)
    expect(json.dig(:error, :details)).to eq(details) if details && json.has_key?(:error)
  end
end
