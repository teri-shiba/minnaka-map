import { act, renderHook } from '@testing-library/react'
import { useMediaQuery } from '~/hooks/useMediaQuery'

function mockMatchMedia(initial = false) {
  type Listener = (e: { matches: boolean, media: string }) => void
  let listeners = new Set<Listener>()
  const state = { media: '', matches: initial }

  window.matchMedia = jest.fn((q: string) => {
    listeners = new Set<Listener>()
    state.media = q
    return {
      media: q,
      get matches() { return state.matches },
      addEventListener: (_: 'change', cb: Listener) => { listeners.add(cb) },
      removeEventListener: (_: 'change', cb: Listener) => { listeners.delete(cb) },
    } as unknown as MediaQueryList
  })

  return {
    setMatches(next: boolean) {
      state.matches = next
      listeners.forEach(cb => cb({ matches: next, media: state.media }))
    },
  }
}

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia

  afterAll(() => {
    window.matchMedia = originalMatchMedia
  })

  it('初期レンダーで matchMedia の結果（false）を返す', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('change イベントで値が更新される', () => {
    const matchMedia = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)

    act(() => matchMedia.setMatches(true))
    expect(result.current).toBe(true)

    act(() => matchMedia.setMatches(false))
    expect(result.current).toBe(false)
  })

  it('アンマウント後に change を起こしても例外にならない', () => {
    const matchMedia = mockMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 800px)'))
    unmount()
    expect(() => act(() => matchMedia.setMatches(true))).not.toThrow()
  })
})
