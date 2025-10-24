class Api::V1::MidpointsController < ApplicationController
  MAX_STATIONS = 6

  def show
    ids = normalize_station_ids(params)

    return render_error("station_ids is empty") if ids.blank?
    return render_error("too many stations", details: ["max=#{MAX_STATIONS}"], status: :unprocessable_entity) if ids.size > MAX_STATIONS

    stations = Station.where(id: ids).select(:id, :latitude, :longitude)
    missing = missing_ids(ids, stations)
    return render_error("not found ids", details: missing, status: :unprocessable_entity) if missing.any?

    center = calc_center(stations)
    sig = SignCoordinatesService.new.call(center[0], center[1])

    data = {
      midpoint: { latitude: sig[:latitude], longitude: sig[:longitude] },
    }

    if Rails.env.production?
      data[:signature]  = sig[:signature]
      data[:expires_at] = sig[:expires_at] if sig.has_key?(:expires_at)
    end

    render_success(data:)
  end

  def validate
    lat        = params[:latitude]
    lng        = params[:longitude]
    signature  = params[:signature]
    expires_at = params[:expires_at]

    if VerifyCoordinatesService.new.call(lat, lng, signature, expires_at)
      render json: { valid: true }
    else
      render json: { valid: false }, status: :bad_request
    end
  end

  private

    def normalize_station_ids(params)
      Array(params[:station_ids]).
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
end
