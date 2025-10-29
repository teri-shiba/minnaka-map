class FavoriteTokenService
  class Invalid < StandardError; end
  class Expired < StandardError; end

  def self.verifier
    Rails.application.message_verifier("favorite-token")
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
    verifier.generate(payload)
  end

  def self.verify!(token)
    params = verifier.verify(token).symbolize_keys
    raise Expired, "token expired" if Time.zone.at(params[:exp]) < Time.current

    params
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    raise Invalid, "Invalid token"
  end
end
