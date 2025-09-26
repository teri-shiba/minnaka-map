import { act, renderHook } from '@testing-library/react'
import * as React from 'react'
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

type Subscribe = Parameters<typeof React.useSyncExternalStore>[0]
type GetSnapshot = Parameters<typeof React.useSyncExternalStore>[1]
type GetServerSnapshot = NonNullable<
  Parameters<typeof React.useSyncExternalStore>[2]
>

function withServerSnapshot<T>(fn: () => T): T {
  const spy = jest
    .spyOn(React, 'useSyncExternalStore')
    .mockImplementation(((
      subscribe: Subscribe,
      _getSnapshot: GetSnapshot,
      getServerSnapshot: GetServerSnapshot,
    ) => {
      const unsubscribe = subscribe(() => {})
      try {
        return getServerSnapshot()
      }
      finally {
        if (typeof unsubscribe === 'function')
          unsubscribe()
      }
    }) as unknown as typeof React.useSyncExternalStore)

  try {
    return fn()
  }
  finally {
    spy.mockRestore()
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

  it('noSsr: true のとき、サーバー初期値は matchMedia の結果を使う', () => {
    mockMatchMedia(true)

    let initial: boolean | undefined
    withServerSnapshot(() => {
      const { result } = renderHook(() =>
        useMediaQuery('min-width: 7698px', { noSsr: true, defaultMatches: false }),
      )
      initial = result.current
    })

    expect(initial).toBe(true)
  })

  it('noSsr: false のとき、サーバー初期値は defaultMatches の結果を使う', () => {
    mockMatchMedia(true)

    let initial: boolean | undefined
    withServerSnapshot(() => {
      const { result } = renderHook(() =>
        useMediaQuery('min-width: 7698px', { noSsr: false, defaultMatches: true }),
      )
      initial = result.current
    })

    expect(initial).toBe(true)
  })
})
