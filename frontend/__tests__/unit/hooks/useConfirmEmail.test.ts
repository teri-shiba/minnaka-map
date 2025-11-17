import { renderHook, waitFor } from '@testing-library/react'
import useConfirmEmail from '~/hooks/useConfirmEmail'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'

let currentQuery = ''
const mockReplace = vi.fn()
const mockSetModalOpen = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: mockReplace,
  })),
  useSearchParams: vi.fn(() => new URLSearchParams(currentQuery)),
}))

vi.mock('~/lib/axios-interceptor', () => ({
  default: { patch: vi.fn() },
}))

vi.mock('jotai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jotai')>()
  return {
    ...actual,
    useSetAtom: vi.fn(() => mockSetModalOpen),
  }
})

function setSearchParams(query: string) {
  currentQuery = query
}

describe('useConfirmEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setSearchParams('')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('メール確認トークンが提供されたとき、確認API成功でモーダルを開き /?success=email_confirmed へ遷移する', async () => {
    setSearchParams('confirmation_token=token-123')
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { success: true } })

    renderHook(() => useConfirmEmail())

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledTimes(1)
      expect(api.patch).toHaveBeenCalledWith(
        expect.any(String),
        { confirmation_token: 'token-123' },
      )
      expect(mockSetModalOpen).toHaveBeenCalledWith(true)
      expect(mockReplace).toHaveBeenCalledWith('/?success=email_confirmed')
    })
  })

  it('メール確認トークンが存在しないとき、確認処理を実行しない', async () => {
    setSearchParams('')

    renderHook(() => useConfirmEmail())

    await waitFor(() => {
      expect(api.patch).not.toHaveBeenCalled()
      expect(mockSetModalOpen).not.toHaveBeenCalled()
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  it('メール確認が失敗したとき、logger を記録し /?error=network_error へ遷移する', async () => {
    setSearchParams('confirmation_token=invalid-token')
    const mockError = new Error('Confirmation failed')
    vi.mocked(api.patch).mockRejectedValueOnce(mockError)

    renderHook(() => useConfirmEmail())

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledTimes(1)
      expect(logger).toHaveBeenCalledWith(
        mockError,
        {
          component: 'useConfirmEmail',
          action: 'confirmEmail',
        },
      )
      expect(mockSetModalOpen).not.toHaveBeenCalled()
      expect(mockReplace).toHaveBeenCalledWith('/?error=network_error')
    })
  })
})
