import { renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import useOAuthCallback from '~/hooks/useOAuthCallback'
import api from '~/lib/axios-interceptor'

let currentQuery = ''
const routerReplaceSpy = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: routerReplaceSpy })),
  useSearchParams: vi.fn(() => new URLSearchParams(currentQuery)),
}))

vi.mock('~/lib/axios-interceptor', () => ({
  default: { get: vi.fn() },
}))

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
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

const mockResetUser = vi.fn()
vi.mock('jotai/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jotai')>()
  return {
    ...actual,
    useResetAtom: vi.fn(() => mockResetUser),
  }
})

vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))

function setSearchParams(query: string) {
  currentQuery = query
}

describe('useOAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setSearchParams('')
    vi.mocked(toast.promise).mockImplementation(promise => promise as any)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('status: success でログイン検証に成功したとき、ユーザー情報を更新しトップページに遷移する', async () => {
    setSearchParams('status=success')
    const response = { data: { login: true, user: { id: 1 } } }
    vi.mocked(api.get).mockResolvedValueOnce(response)

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1)
      expect(api.get).toHaveBeenCalledWith('/current/user/show_status')

      expect(toast.promise).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith('/current/user/show_status')
      expect(routerReplaceSpy).toHaveBeenCalledWith('/', { scroll: false })
    })
  })

  it('status: success でログイン検証に失敗したとき、ユーザー情報をリセットしエラーを表示する', async () => {
    setSearchParams('status=success')
    const response = { data: { login: false } }
    vi.mocked(api.get).mockResolvedValueOnce(response)

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/current/user/show_status')

      expect(mockResetUser).toHaveBeenCalledTimes(1)
      expect(toast.promise).toHaveBeenCalledTimes(1)
      expect(routerReplaceSpy).toHaveBeenCalledWith('/', { scroll: false })
    })
  })

  it('status: success だがAPI呼び出しに失敗したとき、ユーザー状態をリセットしエラーを表示する', async () => {
    setSearchParams('status=success')
    vi.mocked(api.get).mockRejectedValueOnce(new Error('ログインに失敗しました'))

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/current/user/show_status')

      expect(mockResetUser).toHaveBeenCalledTimes(1)
      expect(toast.error).toHaveBeenCalledWith('ログインに失敗しました')
      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  it('status: error でメッセージがあるとき、デコードされたメッセージを表示しユーザー状態をリセットする', async () => {
    const errorMessage = encodeURIComponent('ログインに失敗しました')
    setSearchParams(`status=error&message=${errorMessage}`)

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(mockResetUser).toHaveBeenCalledTimes(1)
      expect(toast.error).toHaveBeenCalledWith('ログインに失敗しました')
      expect(routerReplaceSpy).toHaveBeenCalledWith('/', { scroll: false })
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  it('status: error でメッセージがないとき、デフォルトのエラーメッセージを表示する', async () => {
    setSearchParams(`status=error`)

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(mockResetUser).toHaveBeenCalledTimes(1)
      expect(toast.error).toHaveBeenCalledWith('不正なアクセスです')
      expect(routerReplaceSpy).toHaveBeenCalledWith('/', { scroll: false })
    })
  })

  it('status が不明な値のとき、デフォルトのエラーメッセージを表示する', async () => {
    setSearchParams(`status=unknown`)

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(mockResetUser).toHaveBeenCalledTimes(1)
      expect(toast.error).toHaveBeenCalledWith('不正なアクセスです')
    })
  })

  it('status がパラメータに存在しないとき、何も実行しない', async () => {
    setSearchParams('')

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(api.get).not.toHaveBeenCalled()
      expect(mockResetUser).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
      expect(routerReplaceSpy).not.toHaveBeenCalled()
    }, { timeout: 100 })
  })
})
