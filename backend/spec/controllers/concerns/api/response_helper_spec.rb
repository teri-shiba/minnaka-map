require "rails_helper"

RSpec.describe "Api::ResponseHelper", type: :controller do
  controller(ApplicationController) do
    include Api::ExceptionHandler
    include Api::ResponseHelper

    def ok
      render_success(data: { user: { id: 1, name: "山田太郎" } })
    end

    def ok_without_data
      render_success
    end

    def error
      render_error("失敗しました", details: ["理由 A", "理由 B"], status: :unprocessable_entity)
    end

    def bad_request
      render_error("不正なリクエストです", status: :bad_request)
    end
  end

  def json
    JSON.parse(response.body)
  end

  before do
    routes.draw do
      get "ok" => "anonymous#ok"
      get "ok_without_data" => "anonymous#ok_without_data"
      get "error" => "anonymous#error"
      get "bad_request" => "anonymous#bad_request"
    end
  end

  describe "#render_success" do
    it "200 と { success: true, data:... } を返す" do
      get :ok
      expect(response).to have_http_status(:ok)
      expect(json["success"]).to be(true)
      expect(json["data"]).to eq({ "user" => { "id" => 1, "name" => "山田太郎" } })
      expect(json).not_to have_key("error")
    end

    it "data を渡さない場合、data はキーに含まれない" do
      get :ok_without_data
      expect(response).to have_http_status(:ok)
      expect(json["success"]).to be(true)
      expect(json).not_to have_key("data")
      expect(json).not_to have_key("error")
    end
  end

  describe "#render_error" do
    it "422 と { success: false, error: {message, details }} を返す" do
      get :error
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["success"]).to be(false)
      expect(json.dig("error", "message")).to eq("失敗しました")
      expect(json.dig("error", "details")).to include("理由 A", "理由 B")
      expect(json).not_to have_key("data")
    end

    it "details を渡さない場合、details はキーに含まれない (400)" do
      get :bad_request
      expect(response).to have_http_status(:bad_request)
      expect(json["success"]).to be(false)
      expect(json.dig("error", "message")).to eq("不正なリクエストです")
      expect(json["error"]).not_to have_key("details")
      expect(json).not_to have_key("data")
    end
  end
end
