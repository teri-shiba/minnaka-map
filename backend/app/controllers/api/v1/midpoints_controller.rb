class Api::V1::MidpointsController < ApplicationController
  def create
    valid_stations = params[:area].
                       select {|station| station[:latitude].present? && station[:longitude].present? }.
                       map {|station| [station[:latitude].to_f, station[:longitude].to_f] }

    center = Geocoder::Calculations.geographic_center(valid_stations)

    signature_data = sign_coordinates(center[0], center[1])

    response = {
      midpoint: {
        latitude: signature_data[:latitude],
        longitude: signature_data[:longitude],
      },
      signature: signature_data[:signature],
    }

    response[:expires_at] = signature_data[:expires_at] if Rails.env.production?
    render json: response
  end

  def validate
    lat_str = params[:latitude]
    lng_str = params[:longitude]
    signature = params[:signature]
    expires_at = params[:expires_at]

    if verify_coordinates(lat_str, lng_str, signature, expires_at)
      render json: { valid: true }
    else
      render json: { valid: false }, status: :bad_request
    end
  end
end
