module Api
  module ExceptionHandler
    extend ActiveSupport::Concern

    included do
      rescue_from StandardError, with: :handle_internal_error
      rescue_from InvalidParamError, with: :handle_invalid_param
      rescue_from ActiveRecord::RecordInvalid, with: :handle_record_invalid
      rescue_from ActionController::ParameterMissing, with: :handle_param_missing
      rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
    end

    private

      def handle_invalid_param(exception)
        render_error(exception.message, details: exception.details, status: :unprocessable_entity)
      end

      def handle_record_invalid(exception)
        details = exception.record&.errors&.full_messages
        render_error("入力データが無効です", details: details, status: :unprocessable_entity)
      end

      def handle_param_missing(exception)
        render_error("必須パラメータが不足しています: #{exception.param}", status: :bad_request)
      end

      def handle_record_not_found(exception)
        render_error("リソースが見つかりません", status: :not_found)
      end

      def handle_internal_error(exception)
        if Rails.env.development? || Rails.env.test?
          render_error(exception.message, status: :internal_server_error)
        else
          render_error("サーバーエラーが発生しました", status: :internal_server_error)
        end
      end
  end
end
