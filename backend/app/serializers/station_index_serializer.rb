class StationIndexSerializer < ActiveModel::Serializer
  attributes :id, :name, :latitude, :longitude

  def name
    object.display_name
  end
end
