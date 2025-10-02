import { vi } from 'vitest'

interface MediaChange {
  matches: boolean
  media: string
}

type Listener = (e: MediaChange) => void

export interface MatchMediaController {
  setMatches: (next: boolean) => void
  restore: () => void
}

export function setupMatchMediaMock(initial = false): MatchMediaController {
  const original = window.matchMedia
  let listeners = new Set<Listener>()
  const state = { media: '', matches: initial }

  window.matchMedia = vi.fn((q: string) => {
    listeners = new Set<Listener>()
    state.media = q
    return {
      media: q,
      get matches() { return state.matches },
      addEventListener: (_: 'change', cb: Listener) => { listeners.add(cb) },
      removeEventListener: (_: 'change', cb: Listener) => { listeners.delete(cb) },
    } as unknown as MediaQueryList
  })

  const setMatches = (next: boolean): void => {
    state.matches = next
    listeners.forEach(cb => cb({ matches: next, media: state.media }))
  }

  const restore = (): void => {
    window.matchMedia = original
    listeners.clear()
  }

  return { setMatches, restore }
}
