# frozen_string_literal: true

class SharedFavoriteListShowSerializer < ActiveModel::Serializer
  attributes :title, :created_at, :search_history, :favorites

  def created_at
    object.created_at.iso8601
  end

  def search_history
    {
      id: object.search_history.id,
      station_names: object.search_history.station_names,
    }
  end

  def favorites
    object.search_history.favorites.map do |favorite|
      {
        id: favorite.id,
        hotpepper_id: favorite.hotpepper_id,
      }
    end
  end
end
