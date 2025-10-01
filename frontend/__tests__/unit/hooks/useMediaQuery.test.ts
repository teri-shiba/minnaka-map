import type { MatchMediaController } from '../helpers/dom-helpers'
import { act, renderHook } from '@testing-library/react'
import { useMediaQuery } from '~/hooks/useMediaQuery'
import { setupMatchMediaMock } from '../helpers/dom-helpers'
import { withReactSSRMock } from '../helpers/ssr-helpers'

describe('useMediaQuery', () => {
  let matchMedia: MatchMediaController

  beforeEach(() => {
    matchMedia = setupMatchMediaMock(false)
  })

  afterEach(() => {
    matchMedia.restore()
  })

  it('初期レンダーで matchMedia の結果（false）を返す', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('change イベントで値が更新される', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)

    act(() => matchMedia.setMatches(true))
    expect(result.current).toBe(true)

    act(() => matchMedia.setMatches(false))
    expect(result.current).toBe(false)
  })

  it('アンマウント後に change を起こしても例外にならない', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 800px)'))
    unmount()
    expect(() => act(() => matchMedia.setMatches(true))).not.toThrow()
  })

  it('noSsr: true のとき、SSR 初期値は matchMedia の結果を使う', async () => {
    matchMedia.setMatches(true)
    const initial = await withReactSSRMock(async () => {
      const { useMediaQuery: useMediaQuerySSR } = await import('~/hooks/useMediaQuery')
      const { result } = renderHook(() =>
        useMediaQuerySSR('min-width: 768px', { noSsr: true, defaultMatches: false }),
      )
      return result.current
    })

    expect(initial).toBe(true)
  })

  it('noSsr: false のとき、SSR 初期値は defaultMatches を採用し、matchMedia は無視される', async () => {
    const initial = await withReactSSRMock(async () => {
      const { useMediaQuery: useMediaQuerySSR } = await import('~/hooks/useMediaQuery')
      const { result } = renderHook(() =>
        useMediaQuerySSR('min-width: 768px', { noSsr: false, defaultMatches: true }),
      )
      return result.current
    })

    expect(initial).toBe(true)
  })
})
