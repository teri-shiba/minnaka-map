class Api::V1::SharedListsController < Api::V1::BaseController
  before_action :authenticate_user!, only: [:create]
  before_action :set_shared_list, only: [:show]

  def create
    @search_history = current_user.user.search_histories.find(params[:search_history_id])
    @shared_list, @is_existing = find_or_create_shared_list(@search_history)

    render_success(data: shared_list_response)
  end

  def show
    render_success(data: shared_list_data)
  end

  private

    def find_or_create_shared_list(search_history)
      existing_list = find_existing_shared_list(search_history)
      return [existing_list, true] if existing_list

      new_list = create_new_shared_list(search_history)
      [new_list, false]
    end

    def find_existing_shared_list(search_history)
      current_user.user.shared_favorite_lists.
        where(search_history: search_history, is_public: true).
        first
    end

    def create_new_shared_list(search_history)
      title = search_history.station_names.join("・")
      shared_list = current_user.user.shared_favorite_lists.build(
        search_history: search_history,
        title: title,
      )

      unless shared_list.save
        render_error(shared_list.errors.full_messages.join(", "), :unprocessable_entity)
        return
      end

      shared_list
    end

    def shared_list_response
      {
        share_uuid: @shared_list.share_uuid,
        title: @shared_list.title,
        is_existing: @is_existing,
      }
    end

    def set_shared_list
      @shared_list = SharedFavoriteList.public_lists.find_by!(share_uuid: params[:share_uuid])
    rescue ActiveRecord::RecordNotFound
      render_error("共有リストが見つかりません", :not_found)
    end

    def render_success(data: nil, status: :ok)
      render json: { success: true, data: data }, status: status
    end

    def render_error(message, status)
      render json: { success: false, message: message }, status: status
    end

    def shared_list_data
      {
        title: @shared_list.title,
        created_at: @shared_list.created_at,
        search_history: {
          id: @shared_list.search_history.id,
          station_names: @shared_list.search_history.station_names,
        },
        favorites: @shared_list.search_history.favorites.map do |favorite|
          {
            id: favorite.id,
            hotpepper_id: favorite.hotpepper_id,
          }
        end,
      }
    end
end
