module OmniAuth::LineHelpers
  def raw_info_hash
    {
      "userId" => "hoge",
      "displayName" => "Foo Bar",
      "pictureUrl" => "http://xxx.com/aaa.jpg",
      "email" => "test@example.com",
    }
  end

  def stub_access_token(id_token: nil)
    response = instance_double(OAuth2::Response, parsed: raw_info_hash)
    params = id_token ? { "id_token" => id_token } : {}
    access_token = instance_double(
      OAuth2::AccessToken,
      token: "dummy_token",
      get: response,
      params: params,
    )
    subject.instance_variable_set(:@access_token, access_token)
  end

  def generate_jwt(payload)
    header  = Base64.urlsafe_encode64('{"alg":"none","typ":"JWT"}').gsub(/=+$/, "")
    payload = Base64.urlsafe_encode64(payload.to_json).gsub(/=+$/, "")
    "#{header}.#{payload}.signature"
  end
end

RSpec.configure do |config|
  config.include OmniAuth::LineHelpers, type: :strategy
end
