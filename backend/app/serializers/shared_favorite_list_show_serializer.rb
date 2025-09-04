# frozen_string_literal: true

class SharedFavoriteListShowSerializer < ActiveModel::Serializer
  attributes :title, :created_at, :search_history, :favorites

  def created_at
    object.created_at&.iso8601
  end

  def search_history
    sh = history
    return nil unless sh

    { id: sh.id, station_names: sh.station_names }
  end

  def favorites
    return [] unless history

    history.favorites.
      pluck(:id, :hotpepper_id).
      map {|id, hotpepper_id| { id:, hotpepper_id: } }
  end

  private

    def history
      @history ||= object.search_history
    end
end
