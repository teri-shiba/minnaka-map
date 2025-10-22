import { renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import useConfirmEmail from '~/hooks/useConfirmEmail'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'

let currentQuery = ''
const routerReplaceSpy = vi.fn()
const setModalOpenSpy = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: routerReplaceSpy })),
  useSearchParams: vi.fn(() => new URLSearchParams(currentQuery)),
}))

vi.mock('~/lib/axios-interceptor', () => ({
  default: { patch: vi.fn() },
}))

vi.mock('sonner', () => ({
  toast: { promise: vi.fn() },
}))

vi.mock('jotai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jotai')>()
  return {
    ...actual,
    useSetAtom: vi.fn(() => setModalOpenSpy),
  }
})

vi.mock('~/lib/logger', () => ({
  logger: vi.fn(),
}))

function setSearchParams(query: string) {
  currentQuery = query
}

describe('useConfirmEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setSearchParams('')
    vi.mocked(toast.promise).mockImplementation(promise => promise as any)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('メール確認トークンが提供されたとき、メールアドレスを確認し認証モーダルを開く', async () => {
    setSearchParams('confirmation_token=token-123')
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { success: true } })

    renderHook(() => useConfirmEmail())

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledTimes(1)
      expect(api.patch).toHaveBeenCalledWith(
        expect.any(String),
        { confirmation_token: 'token-123' },
      )
      expect(toast.promise).toHaveBeenCalledTimes(1)
      expect(setModalOpenSpy).toHaveBeenCalledWith(true)
      expect(routerReplaceSpy).toHaveBeenCalledWith('/', { scroll: false })
    })
  })

  it('メール確認トークンが存在しないとき、確認処理を実行しない', async () => {
    setSearchParams('')

    renderHook(() => useConfirmEmail())

    await waitFor(() => {
      expect(api.patch).not.toHaveBeenCalled()
      expect(toast.promise).not.toHaveBeenCalled()
      expect(setModalOpenSpy).not.toHaveBeenCalled()
      expect(routerReplaceSpy).not.toHaveBeenCalled()
    })
  })

  it('メール確認が失敗したとき、ログを記録しホームページへ遷移する', async () => {
    setSearchParams('confirmation_token=invalid-token')
    const mockError = new Error('Confirmation failed')
    vi.mocked(api.patch).mockRejectedValueOnce(mockError)

    renderHook(() => useConfirmEmail())

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledTimes(1)
      expect(toast.promise).toHaveBeenCalledTimes(1)
      expect(logger).toHaveBeenCalledWith(
        mockError,
        {
          component: 'useConfirmEmail',
          action: 'confirmEmail',
        },
      )
      expect(setModalOpenSpy).not.toHaveBeenCalled()
      expect(routerReplaceSpy).toHaveBeenCalledWith('/', { scroll: false })
    })
  })
})
