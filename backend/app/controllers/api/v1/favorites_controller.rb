class Api::V1::FavoritesController < ApplicationController
  before_action :authenticate_user!

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

  private

    def find_user_search_history
      current_user.search_histories.find(favorite_params[:search_history_id])
    end

    def create_favorite(search_history)
      current_user.favorites.create!(
        search_history: search_history,
        hotpepper_id: favorite_params[:hotpepper_id],
      )
    end

    def favorite_params
      params.require(:favorite).permit(:search_history_id, :hotpepper_id)
    end
end
