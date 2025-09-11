class SearchHistorySerializer < ActiveModel::Serializer
  attributes :id, :user_id, :created_at, :updated_at, :station_names
end
