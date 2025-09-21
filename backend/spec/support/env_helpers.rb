module EnvHelpers
  def set_env!(name)
    allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new(name))
  end
end

RSpec.configure do |config|
  config.include EnvHelpers, type: :request
end
