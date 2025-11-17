import type { RestaurantListItem } from '~/types/restaurant'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupCanvasMocks } from '__tests__/integration/helpers/canvas-mocks'
import { server } from '__tests__/integration/setup/msw.server'
import { http, HttpResponse } from 'msw'
import { MapContainer } from 'react-leaflet'
import MapContent from '~/components/features/map/map-content'
import { useMapCoords } from '~/hooks/useMapCoords'
import '@testing-library/jest-dom/vitest'

setupCanvasMocks()

window.scrollTo = vi.fn()

vi.mock('leaflet', async () => {
  const actual = await vi.importActual('leaflet')
  return {
    ...actual,
    icon: vi.fn(() => ({})),
  }
})

vi.mock('~/hooks/useMapCoords', () => ({
  useMapCoords: vi.fn(),
}))

const mockRestaurants: RestaurantListItem[] = [
  {
    id: '1',
    name: 'テストレストラン1',
    station: '東京',
    lat: 35.12345,
    lng: 139.12345,
    genreName: '居酒屋',
    genreCode: 'G001',
    imageUrl: 'https://example.com/image1.jpg',
    close: '月曜日',
  },
  {
    id: '2',
    name: 'テストレストラン2',
    station: '渋谷',
    lat: 35.54321,
    lng: 139.54321,
    genreName: 'イタリアン',
    genreCode: 'G002',
    imageUrl: 'https://example.com/image2.jpg',
    close: '火曜日',
  },
]

const defaultProps = {
  apiKey: 'TEST-KEY',
  midpoint: [35.67890, 139.09876] as [number, number],
  restaurants: mockRestaurants,
  selectedRestaurant: null,
  onRestaurantClick: vi.fn(),
  onRestaurantClose: vi.fn(),
  onMarkerPositionChange: vi.fn(),
  maxBounds: [[35.11, 139.11], [35.22, 139.22]] as [[number, number], [number, number]],
}

function renderMapContent(props = {}) {
  return render(
    <MapContainer center={defaultProps.midpoint} zoom={13}>
      <MapContent {...defaultProps} {...props} />
    </MapContainer>,
  )
}

describe('MapContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    server.use(
      http.get('http://localhost/api/v1/api_keys/maptiler', () => {
        return HttpResponse.json({
          data: { api_key: 'test-maptiler-key' },
        })
      }),
    )
  })

  it('apiKeyが存在するとき、MapTilerLayerがレンダリングされる', () => {
    const { container } = renderMapContent()

    expect(container.querySelector('.leaflet-container')).toBeInTheDocument()
  })

  it('selectedRestaurantの座標がuseMapCoordsに渡される', () => {
    const selectedRestaurant = mockRestaurants[0]
    renderMapContent({ selectedRestaurant })

    expect(useMapCoords).toHaveBeenCalledWith(
      selectedRestaurant.lat,
      selectedRestaurant.lng,
      expect.any(Function),
    )
  })

  it('selectedRestaurantがnullのとき、useMapCoordsにnullが渡される', () => {
    renderMapContent({ selectedRestaurant: null })

    expect(useMapCoords).toHaveBeenCalledWith(
      null,
      null,
      expect.any(Function),
    )
  })

  it('レストランマーカーとZoomControlがレンダリングされる', () => {
    const { container } = renderMapContent()

    const zoomControl = container.querySelector('.leaflet-control-zoom')
    expect(zoomControl).toBeInTheDocument()

    const markers = container.querySelectorAll('.leaflet-marker-icon')
    expect(markers.length).toBeGreaterThan(0)
  })

  it('中心点マーカー（MidpointMarker）がレンダリングされる', () => {
    const { container } = renderMapContent()

    const markers = container.querySelectorAll('.leaflet-marker-icon')
    expect(markers.length).toBeGreaterThanOrEqual(1)
  })

  it('restaurants配列の数だけマーカーがレンダリングされる', () => {
    const { container } = renderMapContent()

    const markers = container.querySelectorAll('.leaflet-marker-icon')
    expect(markers.length).toBe(mockRestaurants.length + 1)
  })

  it('マップクリック時、selectedRestaurantが存在すればonRestaurantCloseが呼ばれる', async () => {
    const user = userEvent.setup()
    const selectedRestaurant = mockRestaurants[0]
    const onRestaurantClose = vi.fn()

    const { container } = renderMapContent({
      selectedRestaurant,
      onRestaurantClose,
    })

    const map = container.querySelector('.leaflet-container')
    await user.click(map!)

    expect(onRestaurantClose).toHaveBeenCalledOnce()
  })

  it('マップクリック時、selectedRestaurantがnullならonRestaurantCloseは呼ばれない', async () => {
    const user = userEvent.setup()
    const onRestaurantClose = vi.fn()

    const { container } = renderMapContent({
      selectedRestaurant: null,
      onRestaurantClose,
    })

    const map = container.querySelector('.leaflet-container')
    await user.click(map!)

    expect(onRestaurantClose).not.toHaveBeenCalled()
  })
})
