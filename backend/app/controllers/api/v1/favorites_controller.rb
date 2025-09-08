class Api::V1::FavoritesController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    page  = Integer(params[:page]  || 1, exception: false) || 1
    limit = Integer(params[:limit] || 5, exception: false) || 5

    groups       = current_user.user.favorites_by_search_history.to_a
    total_groups = groups.size
    slice        = groups.slice((page - 1) * limit, limit) || []

    data = slice.map {|sh, favs| FavoriteGroupSerializer.call(sh, favs) }

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
    search_history = find_user_search_history
    favorite       = create_favorite(search_history)

    render_success(
      data: FavoriteSerializer.call(favorite),
      status: :created,
    )
  end

  def destroy
    favorite = find_user_favorite
    payload  = { id: favorite.id, hotpepper_id: favorite.hotpepper_id }
    favorite.destroy!

    render_success(data: payload, status: :ok)
  end

  private

    def find_user_search_history
      current_user.user.search_histories.find(favorite_params[:search_history_id])
    end

    def find_user_favorite
      current_user.user.favorites.find(params[:id])
    end

    def create_favorite(search_history)
      current_user.user.favorites.create!(
        search_history:,
        hotpepper_id: favorite_params[:hotpepper_id],
      )
    end

    def favorite_params
      params.require(:favorite).require(:search_history_id)
      params.require(:favorite).permit(:search_history_id, :hotpepper_id)
    end
end
