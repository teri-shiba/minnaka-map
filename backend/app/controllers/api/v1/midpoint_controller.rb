class Api::V1::MidpointController < ApplicationController
  MAX_STATIONS = 6

  def create
    ids = normalize_station_ids(params)

    return render_error("station_ids is empty") if ids.blank?
    return render_error("too many stations", :unprocessable_entity, details: ["max=#{MAX_STATIONS}"]) if ids.size > MAX_STATIONS

    stations = Station.where(id: ids).select(:id, :latitude, :longitude)
    missing = missing_ids(ids, stations)
    return render_error("not found ids", :unprocessable_entity, details: missing) if missing.any?

    center = calc_center(stations)
    render_success(data: signed_midpoint_payload(center))
  end

  def validate
    lat_str    = params[:latitude]
    lng_str    = params[:longitude]
    signature  = params[:signature]
    expires_at = params[:expires_at]

    if verify_coordinates(lat_str, lng_str, signature, expires_at)
      render json: { valid: true }
    else
      render json: { valid: false }, status: :bad_request
    end
  end

  private

    def normalize_station_ids(params)
      Array(params.dig(:area, :station_ids)).
        filter_map {|v| (i = Integer(v, exception: false)) and i.positive? ? i : nil }.
        uniq
    end

    def missing_ids(ids, stations)
      ids - stations.map(&:id)
    end

    def calc_center(stations)
      coords = stations.map {|s| [s.latitude.to_f, s.longitude.to_f] }
      Geocoder::Calculations.geographic_center(coords)
    end

    def signed_midpoint_payload(center)
      lat, lng = center
      sig = sign_coordinates(lat, lng)

      payload = {
        midpoint: { latitude: sig[:latitude], longitude: sig[:longitude] },
        signature: sig[:signature],
      }
      payload[:expires_at] = sig[:expires_at] if sig.has_key?(:expires_at)
      payload
    end
end
