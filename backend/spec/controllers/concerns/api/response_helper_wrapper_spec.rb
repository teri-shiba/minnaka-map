require "rails_helper"

RSpec.describe Api::ResponseHelperWrapper do
  before do
    stub_const("Api::ResponseHelper", Module.new do
      def render_error(*args, **kwargs)
        { helper: :error, args: args, kwargs: kwargs }
      end

      def render_success(*args, **kwargs)
        { helper: :success, args: args, kwargs: kwargs }
      end
    end)

    dummy_class.include(Api::ResponseHelper)
    dummy_class.include(Api::ResponseHelperWrapper)
  end

  let(:dummy_class) { Class.new }
  let(:controller)  { dummy_class.new }

  describe "#render_api_error" do
    it "Api::ResponseHelper#render_error を呼び出すこと" do
      result = controller.send(:render_api_error, :not_found, code: 404)

      expect(result).to eq(
        helper: :error,
        args: [:not_found],
        kwargs: { code: 404 },
      )
    end
  end

  describe "#render_api_success" do
    it "Api::ResponseHelper#render_success を呼び出すこと" do
      result = controller.send(:render_api_success, :ok, status: 200)

      expect(result).to eq(
        helper: :success,
        args: [:ok],
        kwargs: { status: 200 },
      )
    end
  end
end
