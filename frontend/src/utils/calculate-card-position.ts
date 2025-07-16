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
  const CARD_WIDTH = 240
  const CARD_HEIGHT = 280
  const OFFSET = 5
  const MARGIN = 10

  let left = pinPosition.x
  let top = pinPosition.y

  if (pinPosition.x < mapCenter.x) {
    left = pinPosition.x + OFFSET
  }
  else {
    left = pinPosition.x - CARD_WIDTH - OFFSET
  }

  if (pinPosition.y < mapCenter.y) {
    top = pinPosition.y + OFFSET
  }
  else {
    top = pinPosition.y - CARD_HEIGHT - OFFSET
  }

  if (pinPosition.x < CARD_WIDTH / 2) {
    left = pinPosition.x + OFFSET
  }
  else if (pinPosition.x > mapSize.width - CARD_WIDTH / 2) {
    left = pinPosition.x - CARD_WIDTH - OFFSET
  }

  if (pinPosition.y < CARD_HEIGHT / 2) {
    top = pinPosition.y + OFFSET
  }
  else if (pinPosition.y > mapSize.height - CARD_HEIGHT / 2) {
    top = pinPosition.y - CARD_HEIGHT - OFFSET
  }

  left = Math.max(MARGIN, Math.min(left, mapSize.width - CARD_WIDTH - MARGIN))
  top = Math.max(MARGIN, Math.min(top, mapSize.height - CARD_HEIGHT - MARGIN))

  return { left, top, transform: '' }
}
