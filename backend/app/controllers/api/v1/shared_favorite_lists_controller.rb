class Api::V1::SharedFavoriteListsController < Api::V1::BaseController
  before_action :authenticate_user!, only: :create

  def show
    shared_list = find_public_shared_list!(params[:share_uuid])

    if shared_list.search_history.favorites.empty?
      return render_error("共有リストが見つかりません", status: :not_found)
    end

    data = SharedFavoriteListShowSerializer.new(shared_list).serializable_hash
    render_success(data: data)
  rescue ActiveRecord::RecordNotFound
    render_error("共有リストが見つかりません", status: :not_found)
  end

  def create
    search_history_id = params.require(:search_history_id)
    search_history = find_search_history!(current_app_user, search_history_id)
    shared_list, is_existing = find_or_create_public_list(current_app_user, search_history)

    data = SharedFavoriteListCreateSerializer.new(shared_list, is_existing: is_existing).serializable_hash
    status = is_existing ? :ok : :created
    render_success(data: data, status: status)
  end

  private

    def find_search_history!(user, id)
      user.search_histories.find(id)
    end

    def find_public_shared_list!(share_uuid)
      SharedFavoriteList.public_lists.
        includes(search_history: :favorites).
        find_by!(share_uuid: share_uuid)
    end

    def find_existing_public_list(user, search_history)
      SharedFavoriteList.public_lists.
        owned_by(user).
        find_by(search_history: search_history)
    end

    def create_public_list!(user, search_history)
      user.shared_favorite_lists.create!(
        search_history: search_history,
        title: generate_title(search_history),
        is_public: true,
      )
    end

    def find_or_create_public_list(user, search_history)
      if (list = find_existing_public_list(user, search_history))
        return [list, true]
      end

      begin
        list = create_public_list!(user, search_history)
        [list, false]
      rescue ActiveRecord::RecordNotUnique
        [find_existing_public_list(user, search_history), true]
      end
    end

    def generate_title(search_history)
      search_history.station_names.join("・")
    end
end
