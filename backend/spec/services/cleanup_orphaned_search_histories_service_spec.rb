require 'rails_helper'

RSpec.describe CleanupOrphanedSearchHistoriesService do
  describe '.call' do
    let!(:user) { create(:user) }

    context 'お気に入りに紐づいていない古い検索履歴があるとき' do
      let!(:old_orphan) do
        create(:search_history, :with_start_stations, user:, station_keys: %i[tokyo], created_at: 2.hours.ago)
      end

      it '削除される' do
        expect { described_class.call }
          .to change { SearchHistory.exists?(old_orphan.id) }
          .from(true).to(false)
      end
    end

    context 'お気に入りに紐づいている古い検索履歴があるとき' do
      let!(:old_with_favorite) do
        create(:search_history, :with_start_stations, :with_favorites,
               user:, station_keys: %i[tokyo], created_at: 2.hours.ago)
      end

      it '削除されない' do
        expect { described_class.call }
          .not_to change { SearchHistory.exists?(old_with_favorite.id) }
      end
    end

    context '新しい検索履歴（1時間以内）があるとき' do
      let!(:recent_orphan) do
        create(:search_history, :with_start_stations, user:, station_keys: %i[tokyo], created_at: 30.minutes.ago)
      end

      it '削除されない' do
        expect { described_class.call }
          .not_to change { SearchHistory.exists?(recent_orphan.id) }
      end
    end
  end
end