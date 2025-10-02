import { vi } from 'vitest'

export async function withReactSSRMock<T>(
  callback: () => Promise<T> | T,
): Promise<T> {
  vi.resetModules()

  vi.doMock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react')

    const mockedUseSyncExternalStore = (
      subscribe: (cb: () => void) => void | (() => void),
      _getSnapshot: unknown,
      getServerSnapshot: () => boolean,
    ): boolean => {
      const unsubscribe = subscribe(() => {})
      try {
        return getServerSnapshot()
      }
      finally {
        if (typeof unsubscribe === 'function')
          unsubscribe()
      }
    }

    return {
      ...actual,
      useSyncExternalStore: mockedUseSyncExternalStore as typeof actual.useSyncExternalStore,
    }
  })

  try {
    return await callback()
  }
  finally {
    vi.unmock('react')
    vi.resetModules()
  }
}
