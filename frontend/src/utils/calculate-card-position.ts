import { CARD_POSITION } from '~/constants'

interface Position {
  x: number
  y: number
}

interface MapInfo {
  pinPosition: Position
  mapCenter: Position
  mapSize: { width: number, height: number }
}

export function calculateCardPosition({ pinPosition, mapCenter, mapSize }: MapInfo) {
  let left = pinPosition.x
  let top = pinPosition.y

  if (pinPosition.x < mapCenter.x) {
    left = pinPosition.x + CARD_POSITION.OFFSET
  }
  else {
    left = pinPosition.x - CARD_POSITION.CARD_WIDTH - CARD_POSITION.OFFSET
  }

  if (pinPosition.y < mapCenter.y) {
    top = pinPosition.y + CARD_POSITION.OFFSET
  }
  else {
    top = pinPosition.y - CARD_POSITION.CARD_HEIGHT - CARD_POSITION.OFFSET
  }

  if (pinPosition.x < CARD_POSITION.CARD_WIDTH / 2) {
    left = pinPosition.x + CARD_POSITION.OFFSET
  }
  else if (pinPosition.x > mapSize.width - CARD_POSITION.CARD_WIDTH / 2) {
    left = pinPosition.x - CARD_POSITION.CARD_WIDTH - CARD_POSITION.OFFSET
  }

  if (pinPosition.y < CARD_POSITION.CARD_HEIGHT / 2) {
    top = pinPosition.y + CARD_POSITION.OFFSET
  }
  else if (pinPosition.y > mapSize.height - CARD_POSITION.CARD_HEIGHT / 2) {
    top = pinPosition.y - CARD_POSITION.CARD_HEIGHT - CARD_POSITION.OFFSET
  }

  left = Math.max(CARD_POSITION.MARGIN, Math.min(left, mapSize.width - CARD_POSITION.CARD_WIDTH - CARD_POSITION.MARGIN))
  top = Math.max(CARD_POSITION.MARGIN, Math.min(top, mapSize.height - CARD_POSITION.CARD_HEIGHT - CARD_POSITION.MARGIN))

  return { left, top, transform: '' }
}
