class FavoriteGroupSerializer
  def self.call(search_history, favorites)
    {
      search_history: {
        id: search_history.id,
        station_names: search_history.station_names,
      },
      favorites: favorites.map {|f| FavoriteSerializer.call(f) },
    }
  end
end
