import type { ReadonlyURLSearchParams } from 'next/navigation'
import { renderHook } from '@testing-library/react'
import { usePagination } from '~/hooks/usePagination'

let currentQuery = ''
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useSearchParams: vi.fn(() => new URLSearchParams(currentQuery) as unknown as ReadonlyURLSearchParams),
}))

function setSearchParams(query: string) {
  currentQuery = query
}

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setSearchParams('')
  })

  describe('createPageUrl', () => {
    it('クエリパラメータがないとき、指定したページ番号のみを含むURLを返す', () => {
      setSearchParams('')
      const { result } = renderHook(() => usePagination())

      const url = result.current.createPageUrl(3)
      expect(url).toBe('?page=3')
    })

    it('既存のクエリパラメータがあるとき、それらを保持したまま新しいページ番号のURLを返す', () => {
      setSearchParams('genre=G001&page=2')
      const { result } = renderHook(() => usePagination())

      const url = result.current.createPageUrl(2)
      const params = new URLSearchParams(url.slice(1))

      expect(params.get('genre')).toBe('G001')
      expect(params.get('page')).toBe('2')
    })

    it('ページ番号パラメータがないとき、新しいページ番号を追加したURLを返す', () => {
      setSearchParams('genre=G002')
      const { result } = renderHook(() => usePagination())

      const url = result.current.createPageUrl(1)
      const params = new URLSearchParams(url.slice(1))

      expect(params.get('genre')).toBe('G002')
      expect(params.get('page')).toBe('1')
    })
  })

  describe('navigateToPage', () => {
    it('クエリパラメータがないとき、指定したページ番号のURLへ遷移する', () => {
      setSearchParams('')
      const { result } = renderHook(() => usePagination())

      result.current.navigateToPage(4)

      expect(mockPush).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('?page=4')
    })

    it('既存のクエリパラメータがあるとき、それらを保持したURLに遷移する', () => {
      setSearchParams('genre=G001')
      const { result } = renderHook(() => usePagination())

      result.current.navigateToPage(2)

      expect(mockPush).toHaveBeenCalledTimes(1)
      const calledUrl = mockPush.mock.calls[0][0] as string
      const params = new URLSearchParams(calledUrl.slice(1))

      expect(params.get('genre')).toBe('G001')
      expect(params.get('page')).toBe('2')
    })
  })
})
