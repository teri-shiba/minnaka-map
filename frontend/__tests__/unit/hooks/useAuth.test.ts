import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { useAuth } from '~/hooks/useAuth'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'
import { createSWRWrapper } from '../../helpers/swr-test-helpers'

const routerReplaceSpy = vi.fn()
const MOCK_PATH = '/result'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: routerReplaceSpy,
  })),
  usePathname: vi.fn(() => MOCK_PATH),
}))

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

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  describe('/current/user/show_status', () => {
    it('未ログインなら isSignedIn=false', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { login: false } })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(false)
      })
    })

    it('ログイン済みならユーザーを設定', async () => {
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

    it('ユーザー情報取得失敗なら isSignedIn=false', async () => {
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
    it('登録成功なら /auth にユーザー情報と confirm_success_url を付けて送信', async () => {
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

      expect(api.post).toHaveBeenCalledWith(
        '/auth',
        expect.objectContaining({
          name: 'Hanako',
          email: 'hanako@example.com',
          password: 'pass123',
          confirm_success_url: expect.stringContaining('/login'),
        }),
      )
    })

    it('登録失敗なら isSignedIn=false', async () => {
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
    it('ログイン成功なら /?success=login へ遷移', async () => {
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
      expect(routerReplaceSpy).toHaveBeenCalledWith('/?success=login')
    })

    it('ログイン失敗なら isSignedIn=false', async () => {
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
    it('ログアウト成功ならトーストしてトップページへ遷移', async () => {
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
      expect(toast.success).toHaveBeenCalledWith('ログアウトしました')
    })

    it('ログアウト失敗なら isSignedIn=false', async () => {
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
    })
  })

  describe('deleteAccount', () => {
    it('削除成功なら /?success=account_deleted へ遷移', async () => {
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

      const { result } = renderHook(() => useAuth(), {
        wrapper: createSWRWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user.isSignedIn).toBe(true)
      })

      const returned = await act(async () => result.current.deleteAccount())

      expect(result.current.user.isSignedIn).toBe(false)
      expect(api.delete).toHaveBeenCalledWith('/auth')
      expect(mockMutate).toHaveBeenCalledWith('/current/user/show_status', null, { revalidate: false })
      expect(sessionStorage.getItem('pendingStationIds')).toBeNull()
      expect(routerReplaceSpy).toHaveBeenCalledWith('/?success=account_deleted')
      expect(returned).toEqual({ success: true })
    })

    it('削除失敗なら logger 記録と error 遷移', async () => {
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
      expect(routerReplaceSpy).toHaveBeenCalledWith('/?error=network_error')
      expect(returned).toEqual({ success: false, error: mockedError })
    })
  })
})
