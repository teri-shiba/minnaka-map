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
    it('未登録のとき addFavoriteByToken が呼び出され、成功すること', async () => {
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
          initialIsFavorite={false}
          initialFavoriteId={null}
          token={mockToken}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存する/ })
      await user.click(button)

      expect(screen.getByRole('button', { name: /保存済み/ })).toBeInTheDocument()

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('お気に入りに追加しました')
      })
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
          initialIsFavorite={false}
          initialFavoriteId={null}
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
          initialIsFavorite={false}
          initialFavoriteId={null}
          initialHistoryId={mockHistoryId}
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
          initialIsFavorite={false}
          initialFavoriteId={null}
          initialHistoryId={mockHistoryId}
        />,
        [[userStateAtom, authenticatedUser]],
      )

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
          return HttpResponse.json(null, { status: 204 })
        }),
      )

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialIsFavorite={true}
          initialFavoriteId={mockFavoriteId}
          initialHistoryId={mockHistoryId}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存済み/ })
      await user.click(button)

      expect(screen.getByRole('button', { name: /保存する/ })).toBeInTheDocument()

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('お気に入りから削除しました')
      })
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
          initialIsFavorite={true}
          initialFavoriteId={mockFavoriteId}
          initialHistoryId={mockHistoryId}
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

  describe('初期状態の表示', () => {
    it('お気に入り一覧から店舗詳細ページに遷移したとき、登録済み状態で表示されること', () => {
      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialIsFavorite={true}
          initialFavoriteId={mockFavoriteId}
          initialHistoryId={mockHistoryId}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      expect(screen.getByRole('button', { name: /保存済み/ })).toBeInTheDocument()
    })

    it('検索結果から遷移したとき、未登録状態で表示されること', () => {
      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialIsFavorite={false}
          initialFavoriteId={null}
          token={mockToken}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      expect(screen.getByRole('button', { name: /保存する/ })).toBeInTheDocument()
    })
  })

  describe('楽観更新', () => {
    it('追加ボタンをクリックしたとき、API 応答前に即座にUIが更新されること', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/favorites', async () => {
          await new Promise(resolve => setTimeout(resolve, 100))

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
          initialIsFavorite={false}
          initialFavoriteId={null}
          token={mockToken}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存する/ })
      await user.click(button)

      expect(screen.getByRole('button', { name: /保存済み/ })).toBeInTheDocument()
    })

    it('削除ボタンをクリックしたとき、API 応答前に即座にUIが更新されること', async () => {
      const user = userEvent.setup()

      server.use(
        http.delete(`*/favorites/${mockFavoriteId}`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100))

          return HttpResponse.json(null, { status: 204 })
        }),
      )

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialIsFavorite={true}
          initialFavoriteId={mockFavoriteId}
          initialHistoryId={mockHistoryId}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存済み/ })
      await user.click(button)

      expect(screen.getByRole('button', { name: /保存する/ })).toBeInTheDocument()
    })

    it('isPending: true のとき、API 処理中にボタンが無効化されること', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/favorites', async () => {
          await new Promise(resolve => setTimeout(resolve, 100))

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
          initialIsFavorite={false}
          initialFavoriteId={null}
          token={mockToken}
        />,
        [[userStateAtom, authenticatedUser]],
      )

      const button = screen.getByRole('button', { name: /保存する/ })
      await user.click(button)

      expect(button).toBeDisabled()

      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('認証チェック', () => {
    it('未認証のとき、エラーメッセージを表示する', async () => {
      const user = userEvent.setup()

      renderWithAtoms(
        <FavoriteButton
          hotpepperId={mockHotPepperId}
          initialIsFavorite={false}
          initialFavoriteId={null}
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
