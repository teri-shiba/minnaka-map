class FavoriteTokenService
  class Invalid < StandardError; end
  class Expired < StandardError; end

  def self.encryptor
    @encryptor ||= begin
      secret = Rails.application.secret_key_base
      key_generator = ActiveSupport::KeyGenerator.new(secret)
      secret_key = key_generator.generate_key("favorite-token", ActiveSupport::MessageEncryptor.key_len)
      ActiveSupport::MessageEncryptor.new(secret_key)
    end
  end

  def self.issue(user_id:, restaurant_id:, context:)
    sh_id = Integer(context.fetch(:search_history_id))
    token_exp = 10.minutes.from_now.to_i

    payload = {
      v: 1,
      uid: user_id,
      res_id: restaurant_id,
      sh_id:,
      exp: token_exp,
    }
    encryptor.encrypt_and_sign(payload)
  end

  def self.verify!(token)
    params = encryptor.decrypt_and_verify(token).symbolize_keys
    raise Expired, "token expired" if Time.zone.at(params[:exp]) < Time.current

    params
  rescue ActiveSupport::MessageEncryptor::InvalidMessage
    raise Invalid, "Invalid token"
  end
end
