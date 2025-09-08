module Api
  module ResponseHelperWrapper
    private

      def render_api_error(*args, **kwargs)
        Api::ResponseHelper.instance_method(:render_error).bind(self).call(*args, **kwargs)
      end

      def render_api_success(*args, **kwargs)
        Api::ResponseHelper.instance_method(:render_success).bind(self).call(*args, **kwargs)
      end
  end
end
