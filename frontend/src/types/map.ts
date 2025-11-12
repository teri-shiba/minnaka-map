import type { LatLngExpression } from 'leaflet'
import type { RestaurantListItem } from './restaurant'

// Map コンポーネントに渡す props
export interface MapItems {
  midpoint: LatLngExpression
  restaurants: RestaurantListItem[]
}

// Leaflet のコンテナ上の座標
export interface Position {
  x: number
  y: number
}

// 地図コンテナの大きさ
export interface MapSize {
  width: number
  height: number
}

// マップ上の状態をまとめた型
export interface MapData {
  markerPosition: Position | null
  mapCenter: Position | null
  mapSize: MapSize | null
}

// カードの表示位置
export interface CardPosition {
  left: number
  top: number
}

// calculateCardPosition の引数
export interface CalculateCardPositionOptions {
  markerPosition: Position
  mapCenter: Position
}
