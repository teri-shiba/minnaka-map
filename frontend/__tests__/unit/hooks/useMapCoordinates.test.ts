import { act, renderHook } from '@testing-library/react'
import { useMapCoordinates } from '~/hooks/useMapCoordinates'

type LeafletEventHandler = (event?: unknown) => void
type EventHandlers = Record<string, LeafletEventHandler>

const registeredEvents: Record<string, LeafletEventHandler[]> = {}

const mapStub = {
  getSize: vi.fn(() => ({ x: 800, y: 600 })),
  getCenter: vi.fn(() => ({
    lat: 35.12345,
    lng: 139.54321,
  })),
  latLngToContainerPoint: vi.fn((latLng) => {
    if (!latLng)
      return null

    if (Array.isArray(latLng) && latLng[0] === 35.0 && latLng[1] === 139.0)
      return { x: 350, y: 280 }

    return { x: 400, y: 300 }
  }),
}

vi.mock('react-leaflet', () => ({
  useMap: vi.fn(() => mapStub),
  useMapEvents: vi.fn((handlers: EventHandlers) => {
    Object.keys(handlers).forEach((event) => {
      registeredEvents[event] = []
    })

    Object.entries(handlers).forEach(([event, handler]) => {
      registeredEvents[event] = [handler]
    })
  }),
}))

function triggerMapEvent(type: string) {
  (registeredEvents[type] ?? []).forEach(handler => handler())
}

function clearRegisteredEvents() {
  Object.keys(registeredEvents).forEach(key => delete registeredEvents[key])
}

describe('useMapCoordinates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearRegisteredEvents()

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1 as unknown as number
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('初期化時、地図の座標情報を計算して onChange に通知する', () => {
    const onChange = vi.fn()

    renderHook(() => useMapCoordinates([35.0, 139.0], onChange))

    expect(onChange).toHaveBeenCalledTimes(1)

    const callArg = onChange.mock.calls[0][0]

    expect(callArg).toEqual({
      mapSize: { width: 800, height: 600 },
      mapCenter: { x: 400, y: 300 },
      markerPosition: { x: 350, y: 280 },
    })
  })

  it('マーカー位置が指定されたとき、そのマーカーの画面座標を含めて通知する', () => {
    const onChange = vi.fn()

    renderHook(() => useMapCoordinates([35.0, 139.0], onChange))

    expect(mapStub.latLngToContainerPoint).toHaveBeenCalledWith([35.0, 139.0])

    const callArg = onChange.mock.calls[0][0]
    expect(callArg.markerPosition).toEqual({ x: 350, y: 280 })
  })

  it('マーカー位置が null のとき、マーカーの画面座標を null として通知する', () => {
    const onChange = vi.fn()

    renderHook(() => useMapCoordinates(null, onChange))

    expect(onChange).toHaveBeenCalled()

    const callArg = onChange.mock.calls[0][0]
    expect(callArg.markerPosition).toBeNull()
  })

  it('地図の移動イベント時、更新された座標情報を onChange に通知する', () => {
    const onChange = vi.fn()
    renderHook(() => useMapCoordinates(null, onChange))

    expect(registeredEvents.moveend?.length).toBeGreaterThan(0)

    onChange.mockClear()

    act(() => {
      triggerMapEvent('moveend')
    })

    expect(onChange).toHaveBeenCalledTimes(1)

    const callArg = onChange.mock.calls[0][0]
    expect(callArg).toHaveProperty('mapSize')
    expect(callArg).toHaveProperty('mapCenter')
    expect(callArg).toHaveProperty('markerPosition')
  })

  it('地図のズームイベント時、更新された座標情報を onChange に通知する', () => {
    const onChange = vi.fn()
    renderHook(() => useMapCoordinates(null, onChange))

    expect(registeredEvents.zoomend?.length).toBeGreaterThan(0)

    onChange.mockClear()

    act(() => {
      triggerMapEvent('zoomend')
    })

    expect(onChange).toHaveBeenCalledTimes(1)

    const callArg = onChange.mock.calls[0][0]
    expect(callArg).toHaveProperty('mapSize')
    expect(callArg).toHaveProperty('mapCenter')
    expect(callArg).toHaveProperty('markerPosition')
  })

  it('マーカー位置が変更されたとき、新しい座標情報を再計算する', () => {
    const onChange = vi.fn()
    const { rerender } = renderHook(
      ({ latLng }: { latLng: [number, number] | null }) => useMapCoordinates(latLng, onChange),
      { initialProps: { latLng: [35.0, 139.0] as [number, number] | null } },
    )

    expect(onChange).toHaveBeenCalledTimes(1)

    const firstCall = onChange.mock.calls[0][0]
    expect(firstCall.markerPosition).toEqual({ x: 350, y: 280 })

    onChange.mockClear()

    rerender({ latLng: [35.1, 139.1] })

    expect(onChange).toHaveBeenCalled()

    const secondCall = onChange.mock.calls[0][0]
    expect(secondCall.markerPosition).toBeDefined()
  })

  it('コンポーネントがアンマウントされるとき、requestAnimationFrame をキャンセルする', () => {
    const onChange = vi.fn()
    const cancelSpy = vi.mocked(cancelAnimationFrame)

    const { unmount } = renderHook(() => useMapCoordinates(null, onChange))

    unmount()

    expect(cancelSpy).toHaveBeenCalled()
  })
})
