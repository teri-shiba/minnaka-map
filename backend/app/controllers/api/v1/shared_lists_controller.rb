# frozen_string_literal: true

class Api::V1::SharedListsController < Api::V1::BaseController
  before_action :authenticate_user!, only: :create

  def create
    search_history_id = params.require(:search_history_id)

    app_user = current_user.user
    search_history = app_user.search_histories.find(search_history_id)

    shared_list = app_user.shared_favorite_lists.
                    public_lists.
                    find_by(search_history: search_history)
    is_existing = shared_list.present?

    shared_list ||= app_user.shared_favorite_lists.create!(
      search_history:,
      title: build_title(search_history),
      is_public: true,
    )

    render_success(data: {
      share_uuid: shared_list.share_uuid,
      title: shared_list.title,
      is_existing: is_existing,
    })
  end

  def show
    shared_list = SharedFavoriteList.public_lists.
                    includes(search_history: :favorites).
                    find_by!(share_uuid: params[:share_uuid])

    render_success(data: SharedFavoriteListShowSerializer.new(shared_list).serializable_hash)
  rescue ActiveRecord::RecordNotFound
    render_error("共有リストが見つかりません", :not_found)
  end

  private

    def build_title(search_history)
      search_history.station_names.join("・")
    end
end
