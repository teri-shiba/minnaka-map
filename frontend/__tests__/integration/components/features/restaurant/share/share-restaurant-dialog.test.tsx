import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupBrowserAPIMocks } from '__tests__/integration/helpers/browser-api-mocks'
import { usePathname } from 'next/navigation'
import ShareRestaurantDialog from '~/components/features/restaurant/share/share-restaurant-dialog'
import '@testing-library/jest-dom/vitest'

setupBrowserAPIMocks()

Object.defineProperty(window, 'location', {
  value: { origin: 'http://localhost:8000' },
  writable: true,
})

const mockOpenNativeShare = vi.fn()

vi.mock('~/hooks/useShare', () => ({
  default: vi.fn(() => ({
    openNativeShare: mockOpenNativeShare,
  })),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, width, height }) => (
    // eslint-disable-next-line next/no-img-element
    <img src={src} alt={alt} width={width} height={height} />
  )),
}))

const mockProps = {
  restaurantName: 'テスト居酒屋',
  restaurantAddress: '東京都千代田区神田1-1-1',
  station: '神田駅',
}

describe('ShareRestaurantDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本表示', () => {
    it('シェアボタンが表示されること', () => {
      render(<ShareRestaurantDialog {...mockProps} />)

      expect(screen.getByRole('button', { name: /シェアする/ })).toBeInTheDocument()
    })
  })

  describe('ネイティブシェア', () => {
    it('ネイティブシェアが成功したとき、ダイアログが開かないこと', async () => {
      const user = userEvent.setup()
      vi.mocked(usePathname).mockReturnValue('/restaurant/J001246910')
      mockOpenNativeShare.mockResolvedValue({ success: true })

      render(<ShareRestaurantDialog {...mockProps} />)

      const shareButton = screen.getByRole('button', { name: /シェアする/ })
      await user.click(shareButton)

      await waitFor(() => {
        expect(mockOpenNativeShare).toHaveBeenCalledWith({
          title: 'テスト居酒屋 [みんなかマップ]',
          text: '店名: テスト居酒屋\n住所: 東京都千代田区神田1-1-1\n最寄駅: 神田駅',
          url: 'http://localhost:8000/restaurant/J001246910',
        })
      })

      expect(screen.queryByText('このお店をシェア')).not.toBeInTheDocument()
    })

    it('ネイティブシェアに失敗したとき、ダイアログが開くこと', async () => {
      const user = userEvent.setup()
      mockOpenNativeShare.mockResolvedValue({ success: false })

      render(<ShareRestaurantDialog {...mockProps} />)

      const shareButton = screen.getByRole('button', { name: /シェアする/ })
      await user.click(shareButton)

      await waitFor(() => {
        expect(screen.getByText('このお店をシェア')).toBeInTheDocument()
      })
    })
  })
})
