export interface RestaurantListItem {
  readonly id: string
  readonly name: string
  readonly station: string
  readonly lat: number
  readonly lng: number
  readonly genreName: string
  readonly genreCode: string
  readonly imageUrl: string
  readonly close: string
}

export interface RestaurantDetailItem extends RestaurantListItem {
  readonly address: string
  readonly budget: string
  readonly capacity: number
  readonly access: string
  readonly urls: string
  readonly open: string
  readonly wifi: string
  readonly privateRoom: string
  readonly card: string
  readonly nonSmoking: string
  readonly charter: string
  readonly parking: string
}

export interface HotPepperRestaurant {
  readonly id: string
  readonly name: string
  readonly address: string
  readonly station_name: string
  readonly lat: number
  readonly lng: number
  readonly genre: {
    readonly code: string
    readonly name: string
  }
  readonly budget: {
    readonly average: string
  }
  readonly catch: string
  readonly capacity: number
  readonly access: string
  readonly urls: {
    readonly pc: string
  }
  readonly photo: {
    readonly pc: {
      readonly l: string
    }
  }
  readonly open: string
  readonly close: string
  readonly wifi: string
  readonly private_room: string
  readonly card: string
  readonly non_smoking: string
  readonly charter: string
  readonly parking: string
}

export function transfromToList(hotpepperData: HotPepperRestaurant): RestaurantListItem {
  return {
    id: hotpepperData.id,
    name: hotpepperData.name,
    station: hotpepperData.station_name,
    lat: hotpepperData.lat,
    lng: hotpepperData.lng,
    genreCode: hotpepperData.genre.code,
    genreName: hotpepperData.genre.name,
    imageUrl: hotpepperData.photo.pc.l,
    close: hotpepperData.close,
  }
}

export function transfromToDetail(hotpepperData: HotPepperRestaurant): RestaurantDetailItem {
  return {
    ...transfromToList(hotpepperData),
    address: hotpepperData.address,
    budget: hotpepperData.budget.average,
    capacity: hotpepperData.capacity,
    access: hotpepperData.access,
    urls: hotpepperData.urls.pc,
    open: hotpepperData.open,
    wifi: hotpepperData.wifi,
    privateRoom: hotpepperData.private_room,
    card: hotpepperData.card,
    nonSmoking: hotpepperData.non_smoking,
    charter: hotpepperData.charter,
    parking: hotpepperData.parking,
  }
}
