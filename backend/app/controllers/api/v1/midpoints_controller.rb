class Api::V1::MidpointsController < ApplicationController
  def create
    area_data = params[:area]
    valid_stations = area_data.
                       select {|station| station[:latitude].present? && station[:longitude].present? }.
                       map {|station| [station[:latitude].to_f, station[:longitude].to_f] }

    center = Geocoder::Calculations.geographic_center(valid_stations)
    signature = sign_coordinates(center[0], center[1])

    render json: {
      midpoint: {
        latitude: center[0],
        longitude: center[1],
      },
      signature: signature,
    }
  end

  def validate
    lat = params[:latitude].to_f
    lng = params[:longitude].to_f
    signature = params[:signature]

    if varify_coodinates(lat, lng, signature)
      render json: { valid: true }
    else
      render json: { valid: false, message: "無効な座標です" }, status: :bad_request
    end
  end
end
