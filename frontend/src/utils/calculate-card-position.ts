import { CARD_POSITION } from '~/constants'

interface Position {
  x: number
  y: number
}

interface MapInfo {
  pinPosition: Position
  mapCenter: Position
}

export function calculateCardPosition({ pinPosition, mapCenter }: MapInfo) {
  // 1.初期位置をピンの座標に設定
  let left = pinPosition.x
  let top = pinPosition.y

  // 2.重複する計算式を事前に算出
  const { CARD_WIDTH, CARD_HEIGHT, OFFSET } = CARD_POSITION

  const rightPosition = pinPosition.x + OFFSET
  const leftPosition = pinPosition.x - CARD_WIDTH - OFFSET
  const bottomPosition = pinPosition.y + OFFSET
  const topPosition = pinPosition.y - CARD_HEIGHT - OFFSET

  // 3.地図中心方向へのカード配置
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

  return { left, top, transform: '' }
}
