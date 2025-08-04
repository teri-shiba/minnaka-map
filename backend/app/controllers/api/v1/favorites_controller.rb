class Api::V1::FavoritesController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    page = params[:page]&.to_i || 1
    limit = params[:limit]&.to_i || 5

    favorites_by_search = current_user.user.favorites_by_search_history
    total_groups = favorites_by_search.count

    paginated_groups = favorites_by_search.to_a.slice((page - 1) * limit, limit) || []

    render json: {
      success: true,
      data: serialize_favorites_by_search_history(paginated_groups),
      meta: {
        current_page: page,
        total_groups: total_groups,
        has_more: page * limit < total_groups,
      },
    }, status: :ok
  rescue => e
    render json: {
      success: false,
      message: "お気に入り一覧の取得に失敗しました #{e.message}",
    }, status: :internal_server_error
  end

  def create
    search_history = find_user_search_history
    favorite = create_favorite(search_history)

    render json: {
      success: true,
      data: favorite,
      message: "お気に入りに追加しました",
    }, status: :created
  rescue => e
    render json: {
      success: false,
      message: "お気に入りの追加に失敗しました #{e.message}",
    }, status: :internal_server_error
  end

  def destroy
    favorite = find_user_favorite
    delete_favorite_data = { id: favorite.id, hotpepper_id: favorite.hotpepper_id }
    favorite.destroy!

    render json: {
      success: true,
      data: delete_favorite_data,
      message: "お気に入りから削除しました",
    }, status: :ok
  rescue => e
    render json: {
      success: false,
      message: "お気に入りの削除に失敗しました #{e.message}",
    }, status: :internal_server_error
  end

  private

    def serialize_favorites_by_search_history(favorites_by_search)
      favorites_by_search.map do |search_history, favorites|
        {
          search_history: {
            id: search_history.id,
            station_names: search_history.station_names,
          },
          favorites: favorites.map(&:as_json),
        }
      end
    end

    def find_user_search_history
      current_user.user.search_histories.find(favorite_params[:search_history_id])
    end

    def find_user_favorite
      current_user.user.favorites.find(params[:id])
    end

    def create_favorite(search_history)
      current_user.user.favorites.create!(
        search_history: search_history,
        hotpepper_id: favorite_params[:hotpepper_id],
      )
    end

    def favorite_params
      params.require(:favorite).permit(:search_history_id, :hotpepper_id)
    end
end
