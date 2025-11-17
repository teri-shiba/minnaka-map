import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSearchParams } from 'next/navigation'
import RestaurantListHeader from '~/components/features/restaurant/restaurant-list-header'
import '@testing-library/jest-dom/vitest'

window.HTMLElement.prototype.hasPointerCapture = vi.fn()
window.HTMLElement.prototype.scrollIntoView = vi.fn()

const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
  })),
  useSearchParams: vi.fn(),
}))

describe('RestaurantListHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('総件数の表示', () => {
    it('totalCount が渡されたとき、正しく表示されること', () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)

      render(<RestaurantListHeader totalCount={10} />)

      expect(screen.getByText(/検索結果 全10件/)).toBeInTheDocument()
    })

    it('totalCount が 0 のとき、0件と表示されること', () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)

      render(<RestaurantListHeader totalCount={0} />)

      expect(screen.getByText(/検索結果 全0件/)).toBeInTheDocument()
    })
  })

  describe('ジャンル選択（PC版Select）', () => {
    it('ジャンルが選択されていないとき、"すべて"が選択状態であること', () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)

      render(<RestaurantListHeader totalCount={10} />)

      const selectTrigger = screen.getByRole('combobox')
      expect(selectTrigger).toHaveTextContent('すべて')
    })

    it('有効なジャンルが選択されているとき、そのジャンル名が表示されること', () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('genre=G001') as any)

      render(<RestaurantListHeader totalCount={10} />)

      const selectTrigger = screen.getByRole('combobox')
      expect(selectTrigger).toHaveTextContent('居酒屋')
    })

    it('ジャンルを変更したとき、page パラメータを削除してURLが更新されること', async () => {
      const user = userEvent.setup()
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=3') as any)

      render(<RestaurantListHeader totalCount={10} />)

      const selectTrigger = screen.getByRole('combobox')
      await user.click(selectTrigger)

      const genreOption = screen.getByRole('option', { name: '居酒屋' })
      await user.click(genreOption)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
        const callArg = mockPush.mock.calls[0][0]
        expect(callArg).toContain('?genre=G001')
        expect(callArg).not.toContain('page')
      })
    })

    it('"すべて"を選択したとき、genre と page パラメータが削除されること', async () => {
      const user = userEvent.setup()
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('genre=G001&page=3') as any)

      render(<RestaurantListHeader totalCount={10} />)

      const selectTrigger = screen.getByRole('combobox')
      await user.click(selectTrigger)

      const genreOption = screen.getByRole('option', { name: 'すべて' })
      await user.click(genreOption)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
        const callArg = mockPush.mock.calls[0][0]
        expect(callArg).not.toContain('genre')
        expect(callArg).not.toContain('page')
      })
    })
  })

  describe('ジャンル選択（SP版Button）', () => {
    it('ジャンルが選択されていないとき、”すべて”が選択状態であること', () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)

      render(<RestaurantListHeader totalCount={10} />)

      const buttons = screen.getAllByRole('button', { name: 'すべて' })
      const SPButton = buttons.at(-1)!

      expect(SPButton).toHaveClass('bg-primary')
    })

    it('有効なジャンルが選択されているとき、そのジャンル名が表示されること', () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('genre=G001') as any)

      render(<RestaurantListHeader totalCount={10} />)

      const buttons = screen.getAllByRole('button', { name: '居酒屋' })
      const SPButton = buttons.at(-1)!

      expect(SPButton).toHaveClass('bg-primary')
    })

    it('ジャンルを変更したとき、page パラメータを削除してURLが更新されること', async () => {
      const user = userEvent.setup()
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=3') as any)

      render(<RestaurantListHeader totalCount={10} />)

      const buttons = screen.getAllByRole('button', { name: '居酒屋' })
      await user.click(buttons.at(-1)!)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
        const callArg = mockPush.mock.calls[0][0]
        expect(callArg).toContain('?genre=G001')
        expect(callArg).not.toContain('page')
      })
    })

    it('"すべて"を選択したとき、genre と page パラメータが削除されること', async () => {
      const user = userEvent.setup()
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('genre=G001&page=3') as any)

      render(<RestaurantListHeader totalCount={10} />)

      const buttons = screen.getAllByRole('button', { name: 'すべて' })
      await user.click(buttons.at(-1)!)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
        const callArg = mockPush.mock.calls[0][0]
        expect(callArg).not.toContain('genre')
        expect(callArg).not.toContain('page')
      })
    })
  })

  describe('無効なジャンルの処理', () => {
    it('無効なパラメータが入力されたとき、削除して replace が呼ばれること', async () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('genre=INVALID') as any)

      render(<RestaurantListHeader totalCount={10} />)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalled()
      })
    })

    it('有効なパラメータのとき、replace が呼ばれないこと', async () => {
      vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('genre=G001') as any)

      render(<RestaurantListHeader totalCount={10} />)

      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalled()
      })
    })
  })
})
