import { act, renderHook } from '@testing-library/react'
import useShare from '~/hooks/useShare'
import { logger } from '~/lib/logger'

let mockIsMobile = true

vi.mock('~/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn((_query: string) => {
    return mockIsMobile
  }),
}))

function setIsMobile(value: boolean) {
  mockIsMobile = value
}

function defineNavigatorShare(
  shareBehavior: (data: ShareData) => Promise<void>,
) {
  Object.defineProperty(window.navigator, 'share', {
    value: vi.fn(shareBehavior),
    configurable: true,
    writable: false,
    enumerable: false,
  })
  return window.navigator.share as unknown as ReturnType<typeof vi.fn>
}

function deleteNavigatorShare() {
  delete (window.navigator as any).share
}

describe('useShare', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setIsMobile(true)
    defineNavigatorShare(async () => {})
  })

  afterEach(() => {
    deleteNavigatorShare()
  })

  it('モバイル環境で共有機能が利用可能なとき、共有データを正常に送信し成功を返す', async () => {
    const shareSpy = defineNavigatorShare(async () => Promise.resolve())

    const { result } = renderHook(() => useShare())
    const payload = {
      title: 'テスト店',
      text: 'おすすめ',
      url: 'http://minnaka-map.com',
    }

    const shareResult = await act(async () => {
      return await result.current.openNativeShare(payload)
    })

    expect(shareSpy).toHaveBeenCalledTimes(1)
    expect(shareSpy).toHaveBeenCalledWith(payload)
    expect(shareResult).toEqual({ success: true })
    expect(logger).not.toHaveBeenCalled()
  })

  it('ユーザーが共有をキャンセルしたとき、エラーとせず成功として扱う', async () => {
    const shareSpy = defineNavigatorShare(async () => {
      const abortError = new DOMException('User cancelled', 'AbortError')
      throw abortError
    })

    const { result } = renderHook(() => useShare())
    const shareResult = await result.current.openNativeShare({
      title: 'テスト店',
      text: 'おすすめ',
      url: 'http://minnaka-map.com',
    })

    expect(shareSpy).toHaveBeenCalledTimes(1)
    expect(shareResult).toEqual({ success: true })
  })

  it('共有処理中に予期しないエラーが発生したとき、失敗を返しログに記録する', async () => {
    const error = new Error('unexpected')
    const shareSpy = defineNavigatorShare(async () => {
      throw error
    })

    const { result } = renderHook(() => useShare())
    const shareResult = await result.current.openNativeShare({
      title: 'テスト店',
      text: 'おすすめ',
      url: 'http://minnaka-map.com',
    })

    expect(shareSpy).toHaveBeenCalledTimes(1)
    expect(shareResult).toEqual({ success: false, reason: 'failed' })
    expect(logger).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'useShare',
      }),
    )
  })
})
