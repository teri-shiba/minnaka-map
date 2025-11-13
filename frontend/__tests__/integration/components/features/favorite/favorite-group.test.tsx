import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockNavigatorClipboard, mockWindowLocationHref, mockWindowOpen, overrideMatchMedia, setupBrowserAPIMocks } from '__tests__/integration/helpers/browser-api-mocks'
import { buildFavoriteGroup, buildFavoriteRestaurant, buildFavoriteWithDetails } from '__tests__/integration/helpers/favorite-fixtures'
import { server } from '__tests__/integration/setup/msw.server'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import FavoriteGroup from '~/components/features/favorite/favorite-group'
import '@testing-library/jest-dom/vitest'

setupBrowserAPIMocks()

vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn().mockResolvedValue({
    accessToken: 'token-123',
    client: 'client-123',
    uid: 'uid-123',
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))

vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt }) => (
    // eslint-disable-next-line next/no-img-element
    <img src={src} alt={alt} />
  )),
}))

// FavoriteButtonをモック化（既にテスト済みのため）
vi.mock('~/components/features/restaurant/favorite-button', () => ({
  default: vi.fn(({ hotpepperId, compact }) => (
    <button type="button" data-testid={`favorite-button-${hotpepperId}`}>
      {compact ? 'Compact' : 'Normal'}
    </button>
  )),
}))

const mockGroup = buildFavoriteGroup(
  1,
  ['東京', '神田'],
  [
    buildFavoriteWithDetails(101, 1, buildFavoriteRestaurant('J001', { name: '居酒屋A' })),
    buildFavoriteWithDetails(102, 1, buildFavoriteRestaurant('J002', { name: '居酒屋B', station: '神田', close: '不定休' })),
    buildFavoriteWithDetails(103, 1, buildFavoriteRestaurant('J003', { name: '居酒屋C', close: '月曜定休' })),
    buildFavoriteWithDetails(104, 1, buildFavoriteRestaurant('J004', { name: '居酒屋D', station: '神田', close: '年末年始' })),
  ],
)

describe('FavoriteGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    overrideMatchMedia(false)

    server.use(
      http.post('*/api/v1/shared_favorite_lists', async () => {
        return HttpResponse.json({
          success: true,
          data: {
            share_uuid: 'uuid-123',
            title: '東京・神田',
            is_existing: false,
          },
        })
      }),
    )
  })

  describe('シェアダイアログフロー', () => {
    it('シェアボタンをクリックし、ダイアログが開き、リンクコピーが動作すること', async () => {
      const user = userEvent.setup()
      mockNavigatorClipboard(async () => { })

      render(<FavoriteGroup group={mockGroup} />)

      await user.click(screen.getByRole('button', { name: /このリストをシェアする/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      expect(screen.getByText('お気に入りリストをシェア')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /リンクをコピーする/ }))

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost/shared/uuid-123')
        expect(toast.success).toHaveBeenCalledWith('リンクをコピーしました')
      })
    })

    it('ダイアログ内のリンクコピーを選択したとき、コピーが成功すること', async () => {
      const user = userEvent.setup()
      mockNavigatorClipboard(async () => { })

      render(<FavoriteGroup group={mockGroup} />)

      await user.click(screen.getByRole('button', { name: /リストをシェアする/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      expect(screen.getByText('お気に入りリストをシェア')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /リンクをコピーする/ }))

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost/shared/uuid-123')
        expect(toast.success).toHaveBeenCalledWith('リンクをコピーしました')
      })
    })

    it('ダイアログ内でメールシェアを選択すると、mailtoリンクが開かれること', async () => {
      const user = userEvent.setup()
      mockWindowLocationHref()

      render(<FavoriteGroup group={mockGroup} />)

      await user.click(screen.getByRole('button', { name: /このリストをシェアする/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /メールでシェアする/ }))

      expect(window.location.href).toContain('mailto:')
      expect(decodeURIComponent(window.location.href)).toContain('東京・神田のまんなかのお店')
    })

    it('ダイアログ内でXシェアを選択すると、X投稿ウィンドウが開かれること', async () => {
      const user = userEvent.setup()
      const openMock = mockWindowOpen()

      render(<FavoriteGroup group={mockGroup} />)

      await user.click(screen.getByRole('button', { name: /このリストをシェアする/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /X でシェアする/ }))

      expect(openMock).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet'),
        '_blank',
        'noopener,noreferrer',
      )
    })
  })

  describe('エラーハンドリング', () => {
    it('API失敗時、エラートーストが表示され、ダイアログが開かないこと', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/api/v1/shared_favorite_lists', async () => {
          return HttpResponse.json({}, { status: 400 })
        }),
      )

      render(<FavoriteGroup group={mockGroup} />)

      await user.click(screen.getByRole('button', { name: /このリストをシェアする/ }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('シェアリストの作成に失敗しました')
      })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('リンクコピー失敗時、エラートーストが表示されること', async () => {
      const user = userEvent.setup()
      mockNavigatorClipboard(async () => {
        throw new Error('Copy Failed')
      })

      render(<FavoriteGroup group={mockGroup} />)

      await user.click(screen.getByRole('button', { name: /このリストをシェアする/ }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /リンクをコピーする/ }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('リンクのコピーに失敗しました')
      })
    })
  })
})
