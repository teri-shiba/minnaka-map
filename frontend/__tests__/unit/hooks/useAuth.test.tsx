import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { useAuth } from '~/hooks/useAuth'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'
import { createSWRWrapper } from './helpers/swr-test-helpers'

vi.mock('~/lib/axios-interceptor', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockMutate = vi.fn()
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>()
  return {
    ...actual,
    useSWRConfig: vi.fn(() => ({ mutate: mockMutate })),
  }
})

vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  describe('/current/user/show_status', () => {
    it('ログインしていないとき、user.isSignedIn は false である', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { login: false } })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(false)
      })
    })

    it('ログインしているとき、user には API レスポンスのユーザー情報を設定する', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          login: true,
          id: 1,
          name: 'Taro',
          email: 'taro@example.com',
          provider: 'email',
        },
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user).toEqual({
          id: 1,
          name: 'Taro',
          email: 'taro@example.com',
          provider: 'email',
          isSignedIn: true,
        })
      })
    })

    it('ユーザー情報の取得に失敗したとき、user.isSignedIn は false になる', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('ユーザー情報の取得に失敗しました'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(false)
      })
    })
  })

  describe('signup', () => {
    it('登録に成功したとき、認証メール確認のトーストメッセージを表示する', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { login: true } })
      vi.mocked(api.post).mockResolvedValueOnce({ status: 200 })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(false)
      })

      await act(async () => {
        await result.current.signup(
          'Hanako',
          'hanako@example.com',
          'pass123',
        )
      })

      expect(api.post).toHaveBeenCalledWith('/auth', {
        name: 'Hanako',
        email: 'hanako@example.com',
        password: 'pass123',
      })
      expect(toast.success).toHaveBeenCalledWith('認証メールをご確認ください')
    })

    it('登録に失敗したとき、user.isSignedIn は false になる', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          login: true,
          id: 2,
          name: 'Yamada',
          email: 'yamada@example.com',
          provider: 'email',
        },
      })
      vi.mocked(api.post).mockRejectedValueOnce(
        new Error('ユーザー登録に失敗しました'),
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(true)
      })

      await act(async () => {
        await result.current.signup(
          'Yamada',
          'yamada@example.com',
          'pass123',
        )
      })

      expect(result.current.user.isSignedIn).toBe(false)
    })
  })

  describe('login', () => {
    it('ログインに成功したとき、user.isSignedIn は false になり、sessionStorage はクリアされ、ログアウト成功のトーストメッセージが表示される', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { login: true } })
      vi.mocked(api.post).mockResolvedValueOnce({ status: 200 })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(false)
      })

      await act(async () => {
        await result.current.login(
          'hanako@example.com',
          'pass123',
        )
      })

      expect(api.post).toHaveBeenCalledWith('/auth/sign_in', {
        email: 'hanako@example.com',
        password: 'pass123',
      })
      expect(mockMutate).toHaveBeenCalledWith('/current/user/show_status')
      expect(toast.success).toHaveBeenCalledWith('ログインに成功しました')
    })

    it('ログインに失敗したとき、user.isSignedIn は false になる', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          login: true,
          id: 3,
          name: 'Tanaka',
          email: 'tamada@example.com',
          provider: 'email',
        },
      })
      vi.mocked(api.post).mockRejectedValueOnce(
        new Error('ログインに失敗しました'),
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(true)
      })

      await act(async () => {
        await result.current.login(
          'tamada@example.com',
          'pass123',
        )
      })

      expect(result.current.user.isSignedIn).toBe(false)
    })
  })

  describe('logout', () => {
    it('ログアウトに成功したとき、user.isSignedIn は false になり、sessionStorage がクリアされ、ログアウト成功のトーストメッセージが表示される', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          login: true,
          id: 4,
          name: 'Naomi',
          email: 'naomi@example.com',
          provider: 'email',
        },
      })
      vi.mocked(api.delete).mockResolvedValueOnce({ status: 200 })

      sessionStorage.setItem('pendingStationIds', '1,2,3')
      sessionStorage.setItem('pendingSearchHistoryId', '999')

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(true)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(api.delete).toHaveBeenCalledWith('/auth/sign_out')
      expect(mockMutate).toHaveBeenCalledWith('/current/user/show_status')
      expect(result.current.user.isSignedIn).toBe(false)
      expect(sessionStorage.getItem('pendingStationIds')).toBeNull()
      expect(sessionStorage.getItem('pendingSearchHistoryId')).toBeNull()
      expect(toast.success).toHaveBeenCalledWith('ログアウトしました')
    })

    it('ログアウトに失敗したとき、user.isSignedIn は false になる', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          login: true,
          id: 5,
          name: 'Sato',
          email: 'sato@example.com',
          provider: 'email',
        },
      })
      vi.mocked(api.delete).mockRejectedValueOnce(
        new Error('ログアウトに失敗しました'),
      )

      sessionStorage.setItem('pendingStationIds', '1,2,3')
      sessionStorage.setItem('pendingSearchHistoryId', '999')

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(true)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user.isSignedIn).toBe(false)
      // 失敗でも resetUser() は呼ばれる仕様（セッションは明示削除しない） <- Why
      // ここでは sessionStorage の削除は保証しない <- Why
    })
  })

  describe('deleteAccount', () => {
    it('アカウント削除に成功したとき、user.isSignedIn は false になり、sessionStorage がクリアされ、削除成功のトーストメッセージが表示され、{ success: true } が返される', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          login: true,
          id: 6,
          name: 'Suzuki',
          email: 'suzuki@example.com',
          provider: 'email',
        },
      })
      vi.mocked(api.delete).mockResolvedValueOnce({ status: 200 })

      sessionStorage.setItem('pendingStationIds', '1,2,3')
      sessionStorage.setItem('pendingSearchHistoryId', '999')

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(true)
      })

      const returned = await result.current.deleteAccount()

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(false)
      })

      expect(api.delete).toHaveBeenCalledWith('/auth')
      expect(mockMutate).toHaveBeenCalledWith('/current/user/show_status')
      expect(sessionStorage.getItem('pendingStationIds')).toBeNull()
      expect(sessionStorage.getItem('pendingSearchHistoryId')).toBeNull()
      expect(toast.success).toHaveBeenCalledWith('アカウントが削除されました')
      expect(returned).toEqual({ success: true })
    })

    it('アカウント削除に失敗したとき、エラーが logger に記録され、エラートーストが表示され、{ success: false, error } が返される', async () => {
      const mockedError = new Error('アカウントが削除に失敗しました')
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          login: true,
          id: 7,
          name: 'Tada',
          email: 'tada@example.com',
          provider: 'email',
        },
      })
      vi.mocked(api.delete).mockRejectedValueOnce(mockedError)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(true)
      })

      const returned = await result.current.deleteAccount()

      expect(logger).toHaveBeenCalledWith(mockedError, {
        component: 'useAuth',
        action: 'deleteAccount',
        extra: {
          userId: 7,
          provider: 'email',
        },
      })
      expect(toast.error).toHaveBeenCalledWith('アカウントの削除に失敗しました')
      expect(returned).toEqual({ success: false, error: mockedError })
    })
  })
})
