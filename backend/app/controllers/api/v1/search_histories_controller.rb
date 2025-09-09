class Api::V1::SearchHistoriesController < Api::V1::BaseController
  before_action :authenticate_user!

  def create
    search_history = find_or_create_search_history_with_stations

    render json: {
      success: true,
      data: serialize_search_history(search_history),
      message: "検索履歴を保存しました",
    }, status: :created
  rescue => e
    Rails.logger.error "Search history creation failed: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: {
      success: false,
      message: "検索履歴の保存に失敗しました: #{e.message}",
    }, status: :internal_server_error
  end

  private

    def find_or_create_search_history_with_stations
      ActiveRecord::Base.transaction do
        existing_history = find_existing_search_history

        if existing_history
          existing_history.update!(updated_at: Time.current)
          Rails.logger.info "既存の検索履歴を再利用: ID #{existing_history.id}"
          return existing_history
        else
          search_history = current_user.user.search_histories.create!
          create_start_station_associations(search_history)
          Rails.logger.info "新規検索履歴を作成: ID #{search_history.id}"
          search_history.reload
        end
      end
    end

    def find_existing_search_history
      ids = station_ids
      return nil if ids.blank?

      current_user.user.search_histories.
        join(:start_stations).
        group("search_histories.id").
        having("array_agg(DISTINCT station.id ORDER BY stations.id) = ARRAY[?]::int[]").
        first
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
      @station_ids ||= Array(search_history_params[:station_ids]).
                         map(&:to_i).
                         select(&:positive?).
                         uniq.
                         sort
    end
end
