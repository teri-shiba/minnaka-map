import type { RestaurantListItem } from '~/types/restaurant'
import type { TokenInfo } from '~/types/token'
import { render, screen } from '@testing-library/react'
import RestaurantCard from '~/components/features/restaurant/restaurant-card'
import '@testing-library/jest-dom/vitest'

// FavoriteButtonをモック化（既にテスト済みのため）
vi.mock('~/components/features/restaurant/favorite-button', () => ({
  default: vi.fn(({ hotpepperId, initialIsFavorite, token, initialHistoryId, compact }) => (
    <button type="button" data-testid="favorite-button">
      {`Mock FavoriteButton: ${hotpepperId}, ${initialIsFavorite}, ${token}, ${initialHistoryId}, ${compact}`}
    </button>
  )),
}))

describe('RestaurantCard', () => {
  const mockRestaurant: RestaurantListItem = {
    id: 'J001246910',
    name: 'テスト居酒屋',
    station: '神田',
    lat: 35.12345,
    lng: 139.12345,
    genreName: '居酒屋',
    genreCode: 'G001',
    imageUrl: 'https://example.com/image.jpg',
    close: '年中無休',
  }

  describe('基本表示', () => {
    it('レストランの基本情報が表示されること', () => {
      render(<RestaurantCard restaurant={mockRestaurant} />)

      expect(screen.getByText('テスト居酒屋')).toBeInTheDocument()
      expect(screen.getByText('居酒屋')).toBeInTheDocument()
      expect(screen.getByText('神田駅')).toBeInTheDocument()
      expect(screen.getByText('年中無休')).toBeInTheDocument()
    })

    it('画像が正しく表示されること', () => {
      render(<RestaurantCard restaurant={mockRestaurant} />)

      const image = screen.getByAltText('テスト居酒屋')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src')
    })
  })

  describe('リンク生成ロジック', () => {
    it('tokenInfo があるとき、トークン付きURLが生成されること', () => {
      const tokenInfo: TokenInfo = {
        token: 'token-123',
        restaurantId: 'J001246910',
        searchHistoryId: 123,
      }

      render(<RestaurantCard restaurant={mockRestaurant} tokenInfo={tokenInfo} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'restaurant/J001246910?t=token-123')
    })

    it('searchHistoryId と favoriteId があるとき、historyId付きURLが生成されること', () => {
      render(
        <RestaurantCard
          restaurant={mockRestaurant}
          searchHistoryId="123"
          favoriteId={101}
        />,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'restaurant/J001246910/?historyId=123')
    })

    it('searchHistoryId があっても favoriteId が undefined のとき、シンプルなURLが生成されること', () => {
      render(
        <RestaurantCard
          restaurant={mockRestaurant}
          searchHistoryId="789"
        />,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'restaurant/J001246910')
    })

    it('tokenInfo も searchHistoryId もないとき、シンプルなURLが生成されること', () => {
      render(<RestaurantCard restaurant={mockRestaurant} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'restaurant/J001246910')
    })

    it('tokenInfo と searchHistoryId の両方があるとき、tokenInfo が優先されること', () => {
      const tokenInfo: TokenInfo = {
        token: 'priority-token',
        restaurantId: 'J001246910',
        searchHistoryId: 456,
      }

      render(
        <RestaurantCard
          restaurant={mockRestaurant}
          tokenInfo={tokenInfo}
          searchHistoryId="789"
          favoriteId={101}
        />,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'restaurant/J001246910?t=priority-token')
    })
  })

  describe('FavoriteButton の統合', () => {
    it('showFavoriteButton が false のとき、FavoriteButton が表示されないこと', () => {
      render(
        <RestaurantCard
          restaurant={mockRestaurant}
          showFavoriteButton={false}
        />,
      )

      expect(screen.queryByTestId('favorite-button')).not.toBeInTheDocument()
    })

    it('showFavoriteButton が true で tokenInfo があるとき、正しい props で FavoriteButton が表示されること', () => {
      const tokenInfo: TokenInfo = {
        token: 'test-token',
        restaurantId: 'J001246910',
        searchHistoryId: 456,
      }

      render(
        <RestaurantCard
          restaurant={mockRestaurant}
          tokenInfo={tokenInfo}
          showFavoriteButton={true}
        />,
      )

      const favoriteButton = screen.getByTestId('favorite-button')
      expect(favoriteButton).toBeInTheDocument()
      expect(favoriteButton).toHaveTextContent('J001246910')
      expect(favoriteButton).toHaveTextContent('test-token')
      expect(favoriteButton).toHaveTextContent('456')
      expect(favoriteButton).toHaveTextContent('true') // compact
    })

    it('showFavoriteButton が true でお気に入りからきたとき、initialIsFavorite が true になること', () => {
      render(
        <RestaurantCard
          restaurant={mockRestaurant}
          searchHistoryId="789"
          favoriteId={101}
          showFavoriteButton={true}
        />,
      )

      const favoriteButton = screen.getByTestId('favorite-button')
      expect(favoriteButton).toHaveTextContent('true') // initialIsFavorite
      expect(favoriteButton).toHaveTextContent('789') // initialHistoryId
    })

    it('showFavoriteButton が true で検索結果からきたとき、initialIsFavorite が false になること', () => {
      const tokenInfo: TokenInfo = {
        token: 'test-token',
        restaurantId: 'J001246910',
        searchHistoryId: 456,
      }

      render(
        <RestaurantCard
          restaurant={mockRestaurant}
          tokenInfo={tokenInfo}
          showFavoriteButton={true}
        />,
      )

      const favoriteButton = screen.getByTestId('favorite-button')
      expect(favoriteButton).toHaveTextContent('false') // initialIsFavorite
    })
  })
})
