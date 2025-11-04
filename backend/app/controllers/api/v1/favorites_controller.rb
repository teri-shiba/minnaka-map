class Api::V1::FavoritesController < Api::V1::BaseController
  before_action :authenticate_user!

  DEFAULT_PAGE = 1
  DEFAULT_LIMIT = 3
  MAX_LIMIT = 10

  def status
    search_history_id = params.require(:search_history_id)
    hotpepper_id      = params.require(:hotpepper_id)

    id = current_app_user.favorites.where(search_history_id:, hotpepper_id:).pick(:id)

    render_success(
      data: {
        is_favorite: id.present?,
        favorite_id: id,
      },
    )
  end

  def index
    page = [Integer(params[:page], exception: false) || DEFAULT_PAGE, DEFAULT_PAGE].max
    limit = (Integer(params[:limit], exception: false) || DEFAULT_LIMIT).clamp(1, MAX_LIMIT)

    groups = current_app_user.favorites_by_search_history.to_a
    total_groups = groups.size
    slice = groups.slice((page - 1) * limit, limit) || []

    data = slice.map do |search_history, favorites|
      FavoriteGroupSerializer.call(search_history, favorites)
    end

    render_success(
      data:,
      meta: {
        current_page: page,
        total_groups: total_groups,
        has_more: page * limit < total_groups,
      },
    )
  end

  def create
    token = params.require(:favorite_token)
    claims = FavoriteTokenService.verify!(token)

    if claims[:uid].to_i != current_app_user.id
      return render_error("権限がありません", status: :forbidden)
    end

    search_history = current_app_user.search_histories.find(claims[:sh_id])

    favorite = current_app_user.favorites.create_or_find_by!(search_history:, hotpepper_id: claims[:res_id])
    status = favorite.previously_new_record? ? :created : :ok

    render_success(data: FavoriteSerializer.call(favorite), status:)
  rescue ActiveRecord::RecordNotFound
    render_error("検索履歴が見つかりません", status: :not_found)
  rescue FavoriteTokenService::Expired
    render_error("トークンが切れています", status: :unprocessable_entity)
  rescue FavoriteTokenService::Invalid
    render_error("トークンが無効です", status: :unprocessable_entity)
  end

  def by_search_history
    sh_id = Integer(params.require(:search_history_id))
    hotpepper_id = params.require(:hotpepper_id)

    search_history = current_app_user.search_histories.find(sh_id)

    unless search_history.available_restaurant_ids.include?(hotpepper_id)
      return render_error("この店舗はこの検索履歴から追加できません", status: :unprocessable_entity)
    end

    favorite = current_app_user.favorites.create_or_find_by!(search_history:, hotpepper_id:)

    status = favorite.previously_new_record? ? :created : :ok

    render_success(data: FavoriteSerializer.call(favorite), status:)
  rescue ActiveRecord::RecordNotFound
    render_error("検索履歴が見つかりません", status: :not_found)
  end

  def destroy
    if (favorite = current_app_user.favorites.find_by(id: params[:id]))
      favorite.destroy!
    end

    head :no_content
  end
end
