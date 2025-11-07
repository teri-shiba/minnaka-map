class StationIndexSerializer < ActiveModel::Serializer
  attributes :id, :name

  def name
    object.display_name
  end
end
