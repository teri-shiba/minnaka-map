import { renderHook, waitFor } from '@testing-library/react'
import useOAuthCallback from '~/hooks/useOAuthCallback'
import api from '~/lib/axios-interceptor'

let currentQuery = ''
const routerReplaceSpy = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: routerReplaceSpy,
  })),
  useSearchParams: vi.fn(() => new URLSearchParams(currentQuery)),
}))

vi.mock('~/lib/axios-interceptor', () => ({
  default: { get: vi.fn() },
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
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('success=login で login:true なら、ユーザーを再検証して終了', async () => {
    setSearchParams('success=login')
    vi.mocked(api.get).mockResolvedValueOnce({ data: { login: true } })

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/current/user/show_status')
      expect(mockMutate).toHaveBeenCalledWith('/current/user/show_status')
    })
  })

  it('success=login で login:false なら、reset して /?error=... に遷移', async () => {
    setSearchParams('success=login')
    vi.mocked(api.get).mockResolvedValueOnce({ data: { login: false } })

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/current/user/show_status')
      expect(mockResetUser).toHaveBeenCalledTimes(1)
    })
  })

  it('success=login だが API 失敗なら reset し /?error=... に遷移', async () => {
    setSearchParams('success=login')
    vi.mocked(api.get).mockRejectedValueOnce(new Error('ログインに失敗しました'))

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/current/user/show_status')
      expect(mockResetUser).toHaveBeenCalledTimes(1)
      expect(mockMutate).not.toHaveBeenCalled()
      expect(routerReplaceSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\/\?error=/),
        { scroll: false },
      )
    })
  })

  it('error パラメータがあれば、reset のみ実行する', async () => {
    setSearchParams(`error=network_error`)

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(mockResetUser).toHaveBeenCalledTimes(1)
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  it('status がパラメータに存在しないとき、何も実行しない', async () => {
    setSearchParams('')

    renderHook(() => useOAuthCallback())

    await waitFor(() => {
      expect(api.get).not.toHaveBeenCalled()
      expect(mockResetUser).not.toHaveBeenCalled()
    }, { timeout: 100 })
  })
})
