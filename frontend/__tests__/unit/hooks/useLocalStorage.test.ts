import { act, renderHook } from '@testing-library/react'
import { useLocalStorage } from '~/hooks/useLocalStorage'
import { logger } from '~/lib/logger'

vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))

const KEY = 'test-key'

function spySetItem() {
  return vi.spyOn(Storage.prototype, 'setItem')
}

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初期読み込み', () => {
    it('既存の値がなければ initialValue を返す', () => {
      const setSpy = spySetItem()
      const { result } = renderHook(() => useLocalStorage(KEY, { id: 1 }))

      expect(result.current[0]).toEqual({ id: 1 })
      expect(setSpy).not.toHaveBeenCalled()
    })

    it('localStorage の JSON を初期値として読み込む', () => {
      localStorage.setItem(KEY, JSON.stringify({ name: 'taro' }))
      const { result } = renderHook(() => useLocalStorage(KEY, { name: 'yamada' }))

      expect(result.current[0]).toEqual({ name: 'taro' })
    })

    it('json が不正なら initialValue を使い logger に記録する', () => {
      localStorage.setItem(KEY, '{')
      const { result } = renderHook(() => useLocalStorage(KEY, 123))

      expect(result.current[0]).toBe(123)
      expect(logger).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          key: KEY,
          component: 'useLocalStorage: storedValue',
        }),
      )
    })

    describe('setValue', () => {
      it('json として同値なら localStorage.setItem を呼ばない', () => {
        localStorage.setItem(KEY, JSON.stringify('same'))
        const setSpy = spySetItem()
        const { result } = renderHook(() => useLocalStorage(KEY, 'init'))
        act(() => result.current[1]('same'))

        expect(result.current[0]).toBe('same')
        expect(setSpy).not.toHaveBeenCalled()
      })

      it('空白入り JSON が保存されていても正規化で同値と判定し書き込まない', () => {
        localStorage.setItem(KEY, '{ "counter" : 1 }\n')
        const setSpy = spySetItem()

        const { result } = renderHook(() => useLocalStorage(KEY, { counter: 0 }))
        act(() => result.current[1]({ counter: 1 }))

        expect(result.current[0]).toEqual({ counter: 1 })
        expect(setSpy).not.toHaveBeenCalled()
      })

      it('アップデータ関数で現在値から更新し JSON で保存する', () => {
        localStorage.setItem(KEY, JSON.stringify(1))
        const setSpy = spySetItem()
        const { result } = renderHook(() => useLocalStorage<number>(KEY, 0))
        act(() => result.current[1](value => value + 1))

        expect(result.current[0]).toBe(2)
        expect(setSpy).toHaveBeenCalledWith(KEY, JSON.stringify(2))
      })

      it('localStorage.setItem が例外でも UI は落ちずに logger に記録される（state は更新済み）', () => {
        const setSpy = spySetItem().mockImplementation(() => {
          throw new Error('failure')
        })
        const { result } = renderHook(() => useLocalStorage(KEY, { theme: 'light' }))
        act(() => result.current[1]({ theme: 'dark' }))

        expect(result.current[0]).toEqual({ theme: 'dark' })
        expect(setSpy).toHaveBeenCalled()
        expect(logger).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            key: KEY,
            component: 'useLocalStorage: setValue',
          }),
        )
      })

      it('JSON.stringify が例外でも UI は落ちず logger に記録される', () => {
        const { result } = renderHook(() => useLocalStorage<any>(KEY, { number: 0 }))
        act(() => result.current[1]({ number: BigInt(1) }))

        expect(result.current[0]).toEqual({ number: BigInt(1) })
        expect(logger).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            key: KEY,
            component: 'useLocalStorage: setValue',
          }),
        )
      })
    })

    describe('refreshValue', () => {
      it('localStorage の最新値を再読み込みして state を更新する', () => {
        const { result } = renderHook(() => useLocalStorage(KEY, { version: 1 }))
        localStorage.setItem(KEY, JSON.stringify({ version: 2 }))
        act(() => result.current[2]())

        expect(result.current[0]).toEqual({ version: 2 })
      })

      it('json が不正なら logger に記録し state は変えない', () => {
        localStorage.setItem(KEY, JSON.stringify({ version: 1 }))
        const { result } = renderHook(() => useLocalStorage(KEY, { version: 0 }))
        localStorage.setItem(KEY, '{ invalid json')
        act(() => result.current[2]())

        expect(result.current[0]).toEqual({ version: 1 })
        expect(logger).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            key: KEY,
            component: 'useLocalStorage: refreshValue',
          }),
        )
      })
    })

    describe('イベント', () => {
      it('同じ key の storage イベントで newValue を反映する', () => {
        const { result } = renderHook(() => useLocalStorage(KEY, { info: 'old' }))
        const payload = JSON.stringify({ info: 'new' })
        act(() => window.dispatchEvent(
          new StorageEvent('storage', { key: KEY, newValue: payload }),
        ))

        expect(result.current[0]).toEqual({ info: 'new' })
      })

      it('異なる key の storage イベントは無視する', () => {
        const { result } = renderHook(() => useLocalStorage(KEY, { info: 'old' }))
        const payload = JSON.stringify({ info: 'new' })
        act(() => window.dispatchEvent(
          new StorageEvent('storage', { key: 'other-key', newValue: payload }),
        ))

        expect(result.current[0]).toEqual({ info: 'old' })
      })

      it('json が不正なら logger に記録し state は変えない', () => {
        const { result } = renderHook(() => useLocalStorage(KEY, { number: 1 }))
        act(() => window.dispatchEvent(
          new StorageEvent('storage', { key: KEY, newValue: '{' }),
        ))

        expect(result.current[0]).toEqual({ number: 1 })
        expect(logger).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            key: KEY,
            component: 'useLocalStorage: handleStorageChange',
          }),
        )
      })

      it('refreshOnFocus が有効なとき focus で最新値を反映する', () => {
        const { result } = renderHook(() => useLocalStorage(KEY, { flag: false }, { refreshOnFocus: true }))
        localStorage.setItem(KEY, JSON.stringify({ flag: true }))
        act(() => window.dispatchEvent(new Event('focus')))

        expect(result.current[0]).toEqual({ flag: true })
      })
    })
  })
})
