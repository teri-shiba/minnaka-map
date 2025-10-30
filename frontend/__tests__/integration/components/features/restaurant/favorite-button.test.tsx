import type { ReactElement } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '__tests__/integration/setup/msw.server'
import { Provider as JotaiProvider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import FavoriteButton from '~/components/features/restaurant/favorite-button'
import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import { initialUserState, userStateAtom } from '~/state/user-state.atom'
import '@testing-library/jest-dom/vitest'

vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

function HydrateAtoms({ children, initialValues }: any) {
  useHydrateAtoms(initialValues)
  return children
}

function renderWithAtoms(ui: ReactElement, initialValues: any) {
  return render(
    <JotaiProvider>
      <HydrateAtoms initialValues={initialValues}>
        {ui}
      </HydrateAtoms>
    </JotaiProvider>,
  )
}

describe('FavoriteButton', () => {
  const mockHistoryId = '11'
  const mockHotPepperId = 'J001246910'
  const mockToken = 'TOKEN'
  const mockFavoriteId = 101

  const authenticatedUser = {
    id: 1,
    name: 'Yamada',
    email: 'yamada@example.com',
    provider: 'email',
    isSignedIn: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthFromCookie).mockResolvedValue({
      accessToken: 'token-123',
      client: 'client-123',
      uid: 'uid-123',
    })
  })

  describe('トークンベースのお気に入り登録', () => {
    it('addFavoriteByToken を呼び出し成功すること', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/favorites', async () => {
          return HttpResponse.json({
            success: true,
            data: {
              id: mockFavoriteId,
              hotpepper_id: mockHotPepperId,
            },
          })
        }),
      )

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          token={mockToken}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存する/ })
      await user.click(button)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('お気に入りに追加しました')
      })

      expect(screen.getByRole('button', { name: /保存済み/ })).toBeInTheDocument()
    })

    it('hotpepperId が一致しないとき、エラーメッセージを返すこと', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/favorites', async () => {
          return HttpResponse.json({
            success: true,
            data: {
              id: mockFavoriteId,
              hotpepper_id: 'J999999999',
            },
          })
        }),
      )

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          token={mockToken}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存する/ })
      await user.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('この店舗は保存できません。検索結果から選択してください。')
      })
    })
  })

  describe('検索履歴IDベースのお気に入り登録', () => {
    it('トークンがなく initialHistoryId があるとき、addFavoriteBySearchHistory を呼ぶ', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/favorites/by_search_history', async () => {
          return HttpResponse.json({
            success: true,
            data: {
              id: mockFavoriteId,
              hotpepper_id: mockHotPepperId,
            },
          })
        }),
      )

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialHistoryId={mockHistoryId}
          initialFavoriteId={mockFavoriteId}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存する/ })
      await user.click(button)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('お気に入りに追加しました')
      })

      expect(screen.getByRole('button', { name: /保存済み/ })).toBeInTheDocument()
    })

    it('追加に失敗したとき、エラーメッセージを表示する', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/favorites/by_search_history', async () => {
          return HttpResponse.json(
            { error: 'この店舗はこの検索履歴から追加できません' },
            { status: 422 },
          )
        }),
      )

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialHistoryId={mockHistoryId}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })

      const button = screen.getByRole('button', { name: /保存する/ })
      await user.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    })
  })

  describe('お気に入り削除処理', () => {
    it('削除に成功したとき、状態が更新されること', async () => {
      const user = userEvent.setup()

      server.use(
        http.delete(`*/favorites/${mockFavoriteId}`, async () => {
          return HttpResponse.json({ status: 204 })
        }),
      )

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialHistoryId={mockHistoryId}
          initialFavoriteId={mockFavoriteId}
          initialIsFavorite={true}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存済み/ })
      await user.click(button)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('お気に入りから削除しました')
      })

      expect(screen.getByRole('button', { name: /保存する/ })).toBeInTheDocument()
    })

    it('削除に失敗したとき、エラーメッセージを表示すること', async () => {
      const user = userEvent.setup()

      server.use(
        http.delete(`*/favorites/${mockFavoriteId}`, async () => {
          return HttpResponse.json(
            { error: '削除に失敗しました' },
            { status: 500 },
          )
        }),
      )

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialHistoryId={mockHistoryId}
          initialFavoriteId={mockFavoriteId}
          initialIsFavorite={true}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存済み/ })
      await user.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    })
  })

  describe('お気に入りの状態チェック', () => {
    it('お気に入り一覧から店舗詳細ページに遷移したとき、状態チェックをスキップすること', async () => {
      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialHistoryId={mockHistoryId}
          initialFavoriteId={mockFavoriteId}
          initialIsFavorite={true}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      expect(screen.getByRole('button', { name: /保存済み/ })).toBeInTheDocument()
    })

    it('未認証のとき、状態チェックをスキップすること', async () => {
      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialHistoryId={mockHistoryId}
        />,
        [[userStateAtom, initialUserState]],
      )

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })
    })

    it('initialHistoryId があるとき、checkFavoriteStatus を呼び出すこと', async () => {
      server.use(
        http.get('*/favorites/status', async () => {
          return HttpResponse.json({
            success: true,
            data: {
              is_favorite: true,
              favorite_id: mockFavoriteId,
            },
          })
        }),
      )

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialHistoryId={mockHistoryId}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /保存済み/ })).toBeInTheDocument()
      })
    })
  })

  describe('認証チェック', () => {
    it('未認証のとき、エラーメッセージを表示する', async () => {
      const user = userEvent.setup()

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          token={mockToken}
        />,
        [[userStateAtom, initialUserState]],
      )

      const button = screen.getByRole('button', { name: /保存する/ })
      await user.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('お気に入りの保存にはログインが必要です')
      })
    })
  })
})
