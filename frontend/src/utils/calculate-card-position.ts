import type { CalculateCardPositionOptions, CardPosition } from '~/types/map'
import { CARD_POSITION } from '~/constants'

export function calculateCardPosition({
  pinPosition,
  mapCenter,
}: CalculateCardPositionOptions): CardPosition {
  const { CARD_WIDTH, CARD_HEIGHT, OFFSET } = CARD_POSITION

  // X 軸：ピン位置が中心より左なら右側、右なら左側にオフセット
  const left
    = pinPosition.x < mapCenter.x
      ? pinPosition.x + OFFSET
      : pinPosition.x - CARD_WIDTH - OFFSET

  // Y 軸：ピン位置が中心より上なら下側、下なら上側にオフセット
  const top
    = pinPosition.y < mapCenter.y
      ? pinPosition.y + OFFSET
      : pinPosition.y - CARD_HEIGHT - OFFSET

  return { left, top }
}
