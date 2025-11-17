import type { PageInfo } from '~/types/pagination'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSearchParams } from 'next/navigation'
import RestaurantPagination from '~/components/features/restaurant/restaurant-pagination'
import '@testing-library/jest-dom/vitest'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
  useSearchParams: vi.fn(),
}))

describe('RestaurantPagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ページネーションUIの統合', () => {
    it('generatePagination と usePagination が統合され、正しいUI構造が生成されること', () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)

      const pagination: PageInfo = {
        currentPage: 5,
        totalPages: 10,
        totalCount: 100,
        itemsPerPage: 10,
      }

      render(<RestaurantPagination pagination={pagination} />)

      expect(screen.getByLabelText('前のページ')).toBeInTheDocument()

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()

      expect(screen.getAllByText('More pages')).toHaveLength(2)

      expect(screen.getByLabelText('次のページ')).toBeInTheDocument()
    })

    it('ページ番号をクリックしたとき、既存のクエリパラメータを保持してページ遷移すること', async () => {
      const user = userEvent.setup()
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('genre=G001&page=1') as any)

      const pagination: PageInfo = {
        currentPage: 1,
        totalPages: 5,
        totalCount: 50,
        itemsPerPage: 10,
      }

      render(<RestaurantPagination pagination={pagination} />)

      const page3Link = screen.getByText('2')
      await user.click(page3Link)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
        const url = mockPush.mock.calls[0][0]
        expect(url).toContain('genre=G001')
        expect(url).toContain('page=2')
      })
    })

    it('前へボタンをクリックしたとき、既存のクエリパラメータを保持して前ページに遷移すること', async () => {
      const user = userEvent.setup()
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('genre=G005&page=3') as any)

      const pagination: PageInfo = {
        currentPage: 3,
        totalPages: 5,
        totalCount: 50,
        itemsPerPage: 10,
      }

      render(<RestaurantPagination pagination={pagination} />)

      const prevButton = screen.getByLabelText('前のページ')
      await user.click(prevButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
        const url = mockPush.mock.calls[0][0]
        expect(url).toContain('genre=G005&page=2')
      })
    })

    it('次へボタンをクリックしたとき、既存のクエリパラメータを保持して次ページに遷移すること', async () => {
      const user = userEvent.setup()
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('genre=G005&page=3') as any)

      const pagination: PageInfo = {
        currentPage: 3,
        totalPages: 5,
        totalCount: 50,
        itemsPerPage: 10,
      }

      render(<RestaurantPagination pagination={pagination} />)

      const nextButton = screen.getByLabelText('次のページ')
      await user.click(nextButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
        const url = mockPush.mock.calls[0][0]
        expect(url).toContain('genre=G005&page=4')
      })
    })
  })

  describe('境界線での動作', () => {
    it('最初のページのとき、前ボタンが無効化され、次へボタンは有効であること', () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=1') as any)

      const pagination: PageInfo = {
        currentPage: 1,
        totalPages: 5,
        totalCount: 50,
        itemsPerPage: 10,
      }

      render(<RestaurantPagination pagination={pagination} />)

      const prevButton = screen.getByLabelText('前のページ')
      const nextButton = screen.getByLabelText('次のページ')

      expect(prevButton).toHaveClass('cursor-not-allowed')
      expect(nextButton).not.toHaveClass('cursor-not-allowed')
    })

    it('最後のページのとき、次ボタンが無効化され、前へボタンは有効であること', () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=15') as any)

      const pagination: PageInfo = {
        currentPage: 5,
        totalPages: 5,
        totalCount: 50,
        itemsPerPage: 10,
      }

      render(<RestaurantPagination pagination={pagination} />)

      const prevButton = screen.getByLabelText('前のページ')
      const nextButton = screen.getByLabelText('次のページ')

      expect(prevButton).not.toHaveClass('cursor-not-allowed')
      expect(nextButton).toHaveClass('cursor-not-allowed')
    })

    it('無効化された前へボタンをクリックしても、ページ遷移しないこと', async () => {
      const user = userEvent.setup()
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=1') as any)

      const pagination: PageInfo = {
        currentPage: 1,
        totalPages: 5,
        totalCount: 50,
        itemsPerPage: 10,
      }

      render(<RestaurantPagination pagination={pagination} />)

      const prevButton = screen.getByLabelText('前のページ')
      await user.click(prevButton)

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('無効化された次へボタンをクリックしても、ページ遷移しないこと', async () => {
      const user = userEvent.setup()
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=5') as any)

      const pagination: PageInfo = {
        currentPage: 5,
        totalPages: 5,
        totalCount: 50,
        itemsPerPage: 10,
      }

      render(<RestaurantPagination pagination={pagination} />)

      const nextButton = screen.getByLabelText('次のページ')
      await user.click(nextButton)

      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
