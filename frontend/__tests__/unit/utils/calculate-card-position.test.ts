import { CARD_POSITION } from '~/constants'
import { calculateCardPosition } from '~/utils/calculate-card-position'

describe('calculateCardPosition', () => {
  const center = { x: 200, y: 200 }
  const { CARD_WIDTH, CARD_HEIGHT, OFFSET } = CARD_POSITION

  it('マーカーが中心より左上のとき、カードは右下に配置される', () => {
    const marker = { x: 100, y: 100 }
    const position = calculateCardPosition({ markerPosition: marker, mapCenter: center })

    expect(position).toEqual({
      left: marker.x + OFFSET,
      top: marker.y + OFFSET,
    })
  })

  it('マーカーが中心より右上のとき、カードは左下に配置される', () => {
    const marker = { x: 300, y: 100 }
    const position = calculateCardPosition({ markerPosition: marker, mapCenter: center })

    expect(position).toEqual({
      left: marker.x - CARD_WIDTH - OFFSET,
      top: marker.y + OFFSET,
    })
  })

  it('マーカーが中心より左下のとき、カードは右上に配置される', () => {
    const marker = { x: 100, y: 300 }
    const position = calculateCardPosition({ markerPosition: marker, mapCenter: center })

    expect(position).toEqual({
      left: marker.x + OFFSET,
      top: marker.y - CARD_HEIGHT - OFFSET,
    })
  })

  it('マーカーが中心より右下のとき、カードは左上に配置される', () => {
    const marker = { x: 300, y: 300 }
    const position = calculateCardPosition({ markerPosition: marker, mapCenter: center })

    expect(position).toEqual({
      left: marker.x - CARD_WIDTH - OFFSET,
      top: marker.y - CARD_HEIGHT - OFFSET,
    })
  })

  it('中心と X と Y が等しいとき、カードは左上に配置される (境界条件)', () => {
    const marker = { x: center.x, y: center.y }
    const position = calculateCardPosition({ markerPosition: marker, mapCenter: center })

    expect(position).toEqual({
      left: marker.x - CARD_WIDTH - OFFSET,
      top: marker.y - CARD_HEIGHT - OFFSET,
    })
  })
})
