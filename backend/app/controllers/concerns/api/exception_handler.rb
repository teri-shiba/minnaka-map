# frozen_string_literal: true

module Api
  module ExceptionHandler
    extend ActiveSupport::Concern

    included do
      rescue_from ActiveRecord::RecordInvalid, with: :handle_record_invalid
      rescue_from ActionController::ParameterMissing, with: :handle_param_missing
      rescue_from StandardError, with: :handle_internal_error
    end

    private

      def handle_record_invalid(exception)
        render_error(
          "入力データが無効です",
          :unprocessable_entity,
          details: exception.record.errors.full_messages,
        )
      end

      def handle_param_missing(exception)
        render_error("必須パラメータが不足しています: #{exception.param}", :bad_request)
      end

      def handle_internal_error(exception)
        if Rails.env.development? || Rails.env.test?
          render_error(exception.message, :internal_server_error)
        else
          render_error("サーバーエラーが発生しました", :internal_server_error)
        end
      end
  end
end
