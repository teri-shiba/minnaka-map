import type { CalculateCardPositionOptions, CardPosition } from '~/types/map'
import { CARD_POSITION } from '~/constants'

export function calculateCardPosition({
  pinPosition,
  mapCenter,
}: CalculateCardPositionOptions): CardPosition {
  // 1.初期位置をピンの座標に設定
  let left = pinPosition.x
  let top = pinPosition.y

  // 2.重複する計算式を事前に算出
  const { CARD_WIDTH, CARD_HEIGHT, OFFSET } = CARD_POSITION

  const rightPosition = pinPosition.x + OFFSET
  const leftPosition = pinPosition.x - CARD_WIDTH - OFFSET
  const bottomPosition = pinPosition.y + OFFSET
  const topPosition = pinPosition.y - CARD_HEIGHT - OFFSET

  /**
   * 3.地図中心方向へのカード配置
   * 目的: 地図外表示防止・カード見切れバグ対策（UIUX考慮）
   * - ピンが中心より左側 → カードを右側に配置（地図内に収める）
   * - ピンが中心より右側 → カードを左側に配置（地図内に収める）
   * - 上下の位置関係も同様に地図中心方向へ配置
   */
  if (pinPosition.x < mapCenter.x) {
    left = rightPosition
  }
  else {
    left = leftPosition
  }

  if (pinPosition.y < mapCenter.y) {
    top = bottomPosition
  }
  else {
    top = topPosition
  }

  return { left, top }
}
