class Api::V1::SearchHistoriesController < Api::V1::BaseController
  before_action :authenticate_user!

  SIZE_RANGE = (2..6)

  def create
    validate_station_ids!
    search_history = find_or_create_search_history_with_stations

    data = ActiveModelSerializers::SerializableResource.
             new(search_history, serializer: SearchHistorySerializer).
             as_json

    render_success(data: data, status: :created)
  end

  private

    def validate_station_ids!
      tokens = cleaned_station_id_tokens
      ints   = parse_integers(tokens)

      if ints.any?(&:nil?)
        bad = tokens.zip(ints).select {|_, i| i.nil? }.map(&:first)
        raise InvalidParamError.new("station_idsは整数のみ指定してください", { invalid_values: bad })
      end

      normalized = normalize_positive_ids(ints)
      unless SIZE_RANGE.cover?(normalized.size)
        raise InvalidParamError.new("station_idsは2〜6件で指定してください", { size: normalized.size })
      end

      ensure_station_ids_exist!(normalized)
      @station_ids = normalized
    end

    def cleaned_station_id_tokens
      raw = search_history_params[:station_ids]
      Array(raw).map {|v| v.is_a?(String) ? v.strip : v }.
        reject {|v| v.nil? || v == "" }
    end

    def parse_integers(tokens)
      tokens.map {|v| Integer(v, exception: false) }
    end

    def normalize_positive_ids(ints)
      ints.compact.select(&:positive?).uniq.sort
    end

    def ensure_station_ids_exist!(ids)
      existing_ids = Station.where(id: ids).pluck(:id).sort
      return if existing_ids == ids

      missing = ids - existing_ids
      raise InvalidParamError.new("存在しない駅IDが含まれています", { missing_ids: missing })
    end

    def find_or_create_search_history_with_stations
      key = station_key

      ActiveRecord::Base.transaction do
        if (existing = current_app_user.search_histories.find_by(station_key: key))
          existing.update!(updated_at: Time.current)
          return existing
        end

        begin
          history = current_app_user.search_histories.create!(station_key: key)
          create_start_station_associations(history)
          history.reload
        rescue ActiveRecord::RecordNotUnique
          history = current_app_user.search_histories.find_by!(station_key: key)
          history.update!(updated_at: Time.current)
        end

        history
      end
    end

    def create_start_station_associations(search_history)
      return if station_ids.empty?

      payload = station_ids.map {|s_id| { station_id: s_id } }
      search_history.search_history_start_stations.create!(payload)
    end

    def search_history_params
      params.require(:search_history).permit(station_ids: [])
    end

    def station_ids
      @station_ids ||= []
    end

    def station_key
      @station_key ||= station_ids.join("-")
    end
end
