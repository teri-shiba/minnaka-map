class Api::V1::SearchHistoriesController < Api::V1::BaseController
  before_action :authenticate_user!

  def create
    search_history = create_search_history_with_stations

    render json: {
      success: true,
      data: serialize_search_history(search_history),
      message: "検索履歴を保存しました",
    }, status: :created
  rescue => e
    render json: {
      success: false,
      message: "検索履歴の保存に失敗しました: #{e.message}",
    }, status: :internal_server_error
  end

  private

    def create_search_history_with_stations
      ActiveRecord::Base.transaction do
        search_history = current_user.search_histories.create!
        create_start_station_associations(search_history)
        search_history.reload
      end
    end

    def create_start_station_associations(search_history)
      station_ids.each do |station_id|
        search_history.search_history_start_stations.create!(station_id: station_id)
      end
    end

    def serialize_search_history(search_history)
      search_history.as_json.merge(
        station_names: search_history.station_names,
      )
    end

    def search_history_params
      params.require(:search_history).permit(station_ids: [])
    end

    def station_ids
      @station_ids ||= Array(search_history_params[:station_ids]).map(&:to_i).select(&:positive?)
    end
end
