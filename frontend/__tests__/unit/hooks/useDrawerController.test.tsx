import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { DRAWER_RATIO } from '~/constants'
import useDrawerController from '~/hooks/useDrawerController'

const startAnimationMock = vi.fn()
vi.mock('framer-motion', () => ({
  useAnimationControls: () => ({ start: startAnimationMock }),
}))

function DrawerHarness(props: { enabled: boolean }) {
  const { enabled } = props
  const { contentRef, dragConstraints, resetPosition } = useDrawerController(enabled)

  useEffect(() => {
    const element = document.querySelector('[data-testid="drawer"]') as HTMLDivElement | null

    if (element) {
      element.dataset.top = String(dragConstraints.top)
      element.dataset.bottom = String(dragConstraints.bottom)
    }
  }, [dragConstraints])

  return (
    <div>
      <div ref={contentRef} data-testid="drawer" />
      <button onClick={resetPosition} type="button">reset</button>
    </div>
  )
}

class ResizeObserverStub {
  constructor(_cb: ResizeObserverCallback) { }
  observe() { }
  unobserve() { }
  disconnect() { }
}

function setOffsetHeight(testId: string, px: number) {
  const element = screen.getByTestId(testId)
  Object.defineProperty(element, 'offsetHeight', { configurable: true, value: px })
}

describe('useDrawerController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // requestAnimationFrame: 直ちにコールバック実行
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1 as unknown as number
    })
    vi.stubGlobal('cancelAnimationFrame', () => { })

    // ResizeObserver: 最小実装
    vi.stubGlobal('ResizeObserver', ResizeObserverStub as unknown as typeof ResizeObserver)

    // visualViewport: iPhone 16 の実際の高さを想定 (852px)
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 852 },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ドロワーが有効かつコンテンツがドロワー領域より長いとき、上方向にスクロール可能な範囲を設定する', async () => {
    render(<DrawerHarness enabled />)

    // content = 600、modalViewHeight = 852 * 0.3 = 255.6 → 差分 344.4
    setOffsetHeight('drawer', 600)
    window.dispatchEvent(new Event('resize'))

    const drawer = screen.getByTestId('drawer')
    const expectedTop = -(600 - 852 * DRAWER_RATIO)

    await waitFor(() => {
      expect(drawer.getAttribute('data-top')).toBe(String(expectedTop))
    })
    expect(drawer.getAttribute('data-bottom')).toBe('0')
  })

  it('ビューポートが取得できないとき、ウィンドウの高さをもとにドロワー領域を計算する', async () => {
    // visualViewport 非対応環境をシミュレート（古いブラウザなど）
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: undefined,
    })
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800)

    render(<DrawerHarness enabled />)

    // content = 700、modalViewHeight = 800 * 0.3 = 240 → 差分 460
    setOffsetHeight('drawer', 700)
    window.dispatchEvent(new Event('resize'))

    const drawer = screen.getByTestId('drawer')
    const expectedTop = -(700 - 800 * DRAWER_RATIO)

    await waitFor(() => {
      expect(drawer.getAttribute('data-top')).toBe(String(expectedTop))
    })
    expect(drawer.getAttribute('data-bottom')).toBe('0')
  })

  it('コンテンツがドロワー領域内に収まるとき、全体が表示されスクロールの必要がない', () => {
    render(<DrawerHarness enabled />)

    // content = 200、modalViewHeight = 852 * 0.3 = 255.6 → 全体が見える
    setOffsetHeight('drawer', 200)
    window.dispatchEvent(new Event('resize'))

    const drawer = screen.getByTestId('drawer')
    expect(drawer.getAttribute('data-top')).toBe('0')
    expect(drawer.getAttribute('data-bottom')).toBe('0')
  })

  it('ドロワーが有効なとき、位置リセット操作で初期位置に戻る', () => {
    render(<DrawerHarness enabled />)
    fireEvent.click(screen.getByText('reset'))
    expect(startAnimationMock).toHaveBeenCalledWith({ y: 0 })
  })

  it('ドロワーが無効なとき、位置リセット操作は実行されない', () => {
    render(<DrawerHarness enabled={false} />)
    fireEvent.click(screen.getByText('reset'))
    expect(startAnimationMock).not.toHaveBeenCalled()
  })
})
