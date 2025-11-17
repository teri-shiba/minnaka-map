/**
 * コンポーネントのテストで必要な Browser API をモックする
 *
 * 以下のエラーが出た場合に使用:
 * - setPointerCapture is not a function
 * - matchMedia is not a function
 */

export function setupBrowserAPIMocks() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn()

  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      getPropertyValue: () => '',
      transform: 'none',
    }),
  })
}

/**
 * matchMedia の戻り値を生成するヘルパー
 * テスト内で matchMedia を上書きする場合に使用
 */
export function createMatchMediaMock(matches: boolean) {
  return vi.fn().mockImplementation(query => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

/**
 * navigator.share をモックする
 */
export function mockNavigatorShare(implementation: () => Promise<void>) {
  Object.defineProperty(navigator, 'share', {
    value: vi.fn(implementation),
    writable: true,
    configurable: true,
  })
}

/**
 * navigator.clipboard をモックする
 */
export function mockNavigatorClipboard(writeTextImplementation: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn(writeTextImplementation) },
    writable: true,
    configurable: true,
  })
}

/**
 * window.location.href をモックする
 */
export function mockWindowLocationHref() {
  const mockLocationHref = { value: '' }

  Object.defineProperty(window, 'location', {
    value: {
      get href() {
        return mockLocationHref.value
      },
      set href(value: string) {
        mockLocationHref.value = value
      },
    },
    writable: true,
    configurable: true,
  })

  return mockLocationHref
}

/**
 * window.open をモックする
 */
export function mockWindowOpen() {
  const mockOpen = vi.fn()
  window.open = mockOpen
  return mockOpen
}

/**
 * window.matchMedia をテスト内で上書きする
 */
export function overrideMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    value: createMatchMediaMock(matches),
    writable: true,
  })
}
