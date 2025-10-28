class Api::V1::FavoriteTokensController < Api::V1::BaseController
  before_action :authenticate_user!

  def batch
    sh_id, lat, lng, sig, exp = required_params
    restaurant_ids = normalized_restaurant_ids

    search_history = current_app_user.search_histories.find(sh_id)

    unless VerifyCoordinatesService.new.call(lat, lng, sig, exp)
      return render_error("invalid_search_signature", status: :unprocessable_entity)
    end

    search_history.update!(available_restaurant_ids: restaurant_ids)

    tokens = restaurant_ids.map do |restaurant_id|
      token = FavoriteToken.issue(
        user_id: current_app_user.id,
        restaurant_id: restaurant_id,
        context: { search_history_id: sh_id },
      )

      { restaurant_id:, favorite_token: token }
    end

    render_success(data: { tokens: })
  end

  private

    def required_params
      sh_id = Integer(params.require(:search_history_id))
      lat = params.require(:lat)
      lng = params.require(:lng)
      sig = params.require(:sig)
      exp = params.require(:exp)
      [sh_id, lat, lng, sig, exp]
    end

    def normalized_restaurant_ids
      Array(params[:restaurant_ids]).map(&:to_s).uniq.first(100)
    end
end
