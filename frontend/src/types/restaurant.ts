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

export interface Restaurant {
  readonly id: string
  readonly name: string
  readonly address: string
  readonly station: string
  readonly lat: number
  readonly lng: number
  readonly genreCode: string
  readonly genreName: string
  readonly budget: string
  readonly catch: string
  readonly capacity: number
  readonly access: string
  readonly urls: string
  readonly imageUrl: string
  readonly open: string
  readonly close: string
  readonly wifi: string
  readonly privateRoom: string
  readonly card: string
  readonly nonSmoking: string
  readonly charter: string
  readonly parking: string

}

export function transfromHotPepperToRestaurant(hotpepperData: HotPepperRestaurant): Restaurant {
  return {
    id: hotpepperData.id,
    name: hotpepperData.name,
    address: hotpepperData.address,
    station: hotpepperData.station_name,
    lat: hotpepperData.lat,
    lng: hotpepperData.lng,
    genreCode: hotpepperData.genre.code,
    genreName: hotpepperData.genre.name,
    budget: hotpepperData.budget.average,
    catch: hotpepperData.catch,
    capacity: hotpepperData.capacity,
    access: hotpepperData.access,
    urls: hotpepperData.urls.pc,
    imageUrl: hotpepperData.photo.pc.l,
    open: hotpepperData.open,
    close: hotpepperData.close,
    wifi: hotpepperData.wifi,
    privateRoom: hotpepperData.private_room,
    card: hotpepperData.card,
    nonSmoking: hotpepperData.non_smoking,
    charter: hotpepperData.charter,
    parking: hotpepperData.parking,
  }
}
