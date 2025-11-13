import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { useFavoriteShare } from '~/hooks/useFavoriteShare'
import useShare from '~/hooks/useShare'
import { createSharedList } from '~/services/create-shared-list'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('~/services/create-shared-list', () => ({
  createSharedList: vi.fn(),
}))

vi.mock('~/hooks/useShare', () => ({
  default: vi.fn(),
}))

describe('useFavoriteShare', () => {
  const mockOpenNativeShare = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useShare).mockReturnValue({
      openNativeShare: mockOpenNativeShare,
    })
  })

  describe('初期状態', () => {
    it('isSharing が false、dialogState が null であること', () => {
      const { result } = renderHook(() => useFavoriteShare({ searchHistoryId: 1 }))

      expect(result.current.isSharing).toBe(false)
      expect(result.current.dialogState).toBeNull()
    })
  })

  describe('handleShare の動作', () => {
    it('API成功 → ネイティブシェア成功のとき、dialogState が null のままであること', async () => {
      vi.mocked(createSharedList).mockResolvedValue({
        success: true,
        data: {
          shareUuid: 'uuid-123',
          title: '東京・神田',
          isExisting: false,
        },
      })

      mockOpenNativeShare.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useFavoriteShare({ searchHistoryId: 1 }))

      await act(async () => {
        await result.current.handleShare()
      })

      await waitFor(() => {
        expect(result.current.isSharing).toBe(false)
      })

      expect(result.current.dialogState).toBeNull()
      expect(mockOpenNativeShare).toHaveBeenCalledWith({
        title: '東京・神田のおすすめリスト',
        text: '東京・神田のおすすめレストランをチェック！',
        url: 'http://localhost/shared/uuid-123',
      })
    })

    it('API成功 → ネイティブシェア失敗のとき、dialogState に値がセットされること', async () => {
      vi.mocked(createSharedList).mockResolvedValue({
        success: true,
        data: {
          shareUuid: 'uuid-123',
          title: '東京・神田',
          isExisting: false,
        },
      })

      mockOpenNativeShare.mockResolvedValue({ success: false, reason: 'unsupported' })

      const { result } = renderHook(() => useFavoriteShare({ searchHistoryId: 2 }))

      await act(async () => {
        await result.current.handleShare()
      })

      await waitFor(() => {
        expect(result.current.isSharing).toBe(false)
      })

      expect(result.current.dialogState).toEqual({
        data: {
          shareUuid: 'uuid-123',
          title: '東京・神田',
          isExisting: false,
        },
        url: 'http://localhost/shared/uuid-123',
      })
    })

    it('API失敗のとき、エラートーストが表示され dialogState は null のままであること', async () => {
      vi.mocked(createSharedList).mockResolvedValue({
        success: false,
        message: 'シェアリストの作成に失敗しました',
        cause: 'REQUEST_FAILED',
      })

      const { result } = renderHook(() => useFavoriteShare({ searchHistoryId: 3 }))

      await act(async () => {
        await result.current.handleShare()
      })

      await waitFor(() => {
        expect(result.current.isSharing).toBe(false)
      })

      expect(toast.error).toHaveBeenCalledWith('シェアリストの作成に失敗しました')
      expect(result.current.dialogState).toBeNull()
      expect(mockOpenNativeShare).not.toHaveBeenCalled()
    })
  })

  describe('closeDialog の動作', () => {
    it('closeDialog 呼び出しで dialogState が null になること', async () => {
      vi.mocked(createSharedList).mockResolvedValue({
        success: true,
        data: {
          shareUuid: 'uuid-123',
          title: '東京・神田',
          isExisting: false,
        },
      })

      mockOpenNativeShare.mockResolvedValue({ success: false, reason: 'failed' })

      const { result } = renderHook(() => useFavoriteShare({ searchHistoryId: 4 }))

      await act(async () => {
        await result.current.handleShare()
      })

      await waitFor(() => {
        expect(result.current.dialogState).not.toBeNull()
      })

      act(() => {
        result.current.closeDialog()
      })

      expect(result.current.dialogState).toBeNull()
    })
  })

  describe('ローディング状態', () => {
    it('handleShare 実行中は isSharing が true になること', async () => {
      let resolveCreateSharedList: (value: any) => void

      vi.mocked(createSharedList).mockReturnValue(
        new Promise((resolve) => {
          resolveCreateSharedList = resolve
        }),
      )

      const { result } = renderHook(() => useFavoriteShare({ searchHistoryId: 5 }))

      act(() => {
        result.current.handleShare()
      })

      expect(result.current.isSharing).toBe(true)

      await act(async () => {
        resolveCreateSharedList!({
          success: true,
          data: {
            shareUuid: 'uuid-loading',
            title: 'テスト',
            isExisting: false,
          },
        })
      })

      mockOpenNativeShare.mockResolvedValue({ success: true })

      await waitFor(() => {
        expect(result.current.isSharing).toBe(false)
      })
    })
  })
})
