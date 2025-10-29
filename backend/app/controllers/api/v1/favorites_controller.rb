class Api::V1::FavoritesController < Api::V1::BaseController
  before_action :authenticate_user!

  DEFAULT_PAGE = 1
  DEFAULT_LIMIT = 3
  MAX_LIMIT = 10

  def status
    search_history_id = params.require(:search_history_id)
    hotpepper_id      = params.require(:hotpepper_id)

    favorite = current_app_user.favorites.find_by(
      search_history_id: search_history_id,
      hotpepper_id: hotpepper_id,
    )

    render_success(
      data: {
        is_favorite: favorite.present?,
        favorite_id: favorite&.id,
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
      data: data,
      meta: {
        current_page: page,
        total_groups: total_groups,
        has_more: page * limit < total_groups,
      },
    )
  end

  def create
    token = params.require(:favorite_token)
    claims = FavoriteToken.verify!(token)

    if claims[:uid].to_i != current_app_user.id
      return render_error("権限がありません", status: :forbidden)
    end

    search_history = current_app_user.search_histories.find(claims[:sh_id])

    favorite = current_app_user.favorites.find_or_initialize_by(search_history:, hotpepper_id: claims[:res_id])
    is_new_record = favorite.new_record?
    favorite.save!

    render_success(data: FavoriteSerializer.call(favorite), status: is_new_record ? :created : :ok)
  rescue ActiveRecord::RecordNotFound
    render_error("検索履歴が見つかりません", status: :not_found)
  rescue FavoriteToken::Expired
    render_error("トークンが切れています", status: :unprocessable_entity)
  rescue FavoriteToken::Invalid
    render_error("トークンが無効です", status: :unprocessable_entity)
  end

  def by_search_history
    sh_id = Integer(params.require(:search_history_id))
    hotpepper_id = params.require(:hotpepper_id)

    search_history = current_app_user.search_histories.find(sh_id)

    unless search_history.available_restaurant_ids.include?(hotpepper_id)
      return render_error("この店舗はこの検索履歴から追加できません", status: :unprocessable_entity)
    end

    favorite = current_app_user.favorites.find_or_initialize_by(search_history:, hotpepper_id:)
    is_new_record = favorite.new_record?
    favorite.save!

    render_success(data: FavoriteSerializer.call(favorite), status: is_new_record ? :created : :ok)
  rescue ActiveRecord::RecordNotFound
    render_error("検索履歴が見つかりません", status: :not_found)
  end

  def destroy
    favorite = current_app_user.favorites.find(params[:id])
    payload  = { id: favorite.id, hotpepper_id: favorite.hotpepper_id }
    favorite.destroy!

    render_success(data: payload, status: :ok)
  end
end
