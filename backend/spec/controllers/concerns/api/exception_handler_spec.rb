require "rails_helper"

RSpec.describe "Api::ExceptionHandler", type: :controller do
  controller(ApplicationController) do
    include Api::ExceptionHandler
    include Api::ResponseHelper

    def record_invalid
      user = User.new
      user.errors.add(:name, :blank)
      error = ActiveRecord::RecordInvalid.new(user)
      raise error
    end

    def param_missing
      raise ActionController::ParameterMissing, :name
    end

    def internal_error
      raise StandardError, "Internal error"
    end
  end

  def json
    JSON.parse(response.body)
  end

  before do
    routes.draw do
      get "record_invalid" => "anonymous#record_invalid"
      get "param_missing"  => "anonymous#param_missing"
      get "internal_error" => "anonymous#internal_error"
    end
  end

  describe "ActiveRecord::RecordInvalid" do
    it "422 と詳細メッセージを返す" do
      get :record_invalid
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json.dig("error", "message")).to eq("入力データが無効です")
      expect(json.dig("error", "details")).to include("名前を入力してください")
    end
  end

  describe "ActionController::ParameterMissing" do
    it "400 と不足パラメーター名を返す" do
      get :param_missing
      expect(response).to have_http_status(:bad_request)
      expect(json.dig("error", "message")).to include("必須パラメータが不足しています")
    end
  end

  describe "StandardError" do
    context "test/development 環境" do
      it "500 と内部メッセージを返す" do
        get :internal_error
        expect(response).to have_http_status(:internal_server_error)
        expect(json.dig("error", "message")).to eq("Internal error")
      end
    end

    context "production 環境" do
      before do
        allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("production"))
      end

      it "500 と汎用メッセージを返す" do
        get :internal_error
        expect(response).to have_http_status(:internal_server_error)
        expect(json.dig("error", "message")).to eq("サーバーエラーが発生しました")
      end
    end
  end
end
