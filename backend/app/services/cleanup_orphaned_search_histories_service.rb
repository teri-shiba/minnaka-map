class CleanupOrphanedSearchHistoriesService
  def self.call
    SearchHistory.
      left_joins(:favorites).
      where(favorites: { id: nil }).
      where("search_histories.created_at < ?", 1.hour.ago).
      destroy_all
  end
end
