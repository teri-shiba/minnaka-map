class Api::V1::HotpepperController < ApplicationController
  def api_key
    render json: { api_key: Rails.application.credentials.hotpepper[:api_key] }
  end
end
