import type { ServiceResult } from '~/types/service-result'
import { apiFetch, handleApiError } from '~/services/api-client'
import { saveSearchHistory } from '~/services/save-search-history'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'

vi.mock('~/services/api-client', () => ({
  apiFetch: vi.fn(),
  handleApiError: vi.fn(),
}))

vi.mock('~/types/api-response', () => ({
  isApiSuccess: vi.fn(),
  getApiErrorMessage: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)
const mockedHandleApiError = vi.mocked(handleApiError)
const mockedIsApiSuccess = vi.mocked(isApiSuccess)
const mockedGetApiErrorMessage = vi.mocked(getApiErrorMessage)

describe('save-search-history', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('API が失敗を示したとき、取得したエラーメッセージを設定して返す', async () => {
    const apiResponse = { error: [{ message: '保存に失敗しました' }] }
    mockedApiFetch.mockResolvedValue(apiResponse)
    mockedIsApiSuccess.mockReturnValue(false)
    mockedGetApiErrorMessage.mockReturnValue('保存に失敗しました')

    const result = await saveSearchHistory([101])

    expect(apiFetch).toHaveBeenCalledWith('search_histories', {
      method: 'POST',
      body: { searchHistory: { stationIds: [101] } },
      withAuth: true,
    })
    expect(getApiErrorMessage).toHaveBeenCalledWith(apiResponse)
    expect(result).toEqual<ServiceResult<{ searchHistoryId: number | null }>>({
      success: false,
      message: '保存に失敗しました',
      cause: 'REQUEST_FAILED',
    })
    expect(handleApiError).not.toHaveBeenCalled()
  })

  it('API が成功を示したとき、取得した id を searchHistoryId として渡す', async () => {
    mockedApiFetch.mockResolvedValue({ data: { id: 123 } })
    mockedIsApiSuccess.mockReturnValue(true)

    const result = await saveSearchHistory([101, 102])

    expect(apiFetch).toHaveBeenCalledWith('search_histories', {
      method: 'POST',
      body: { searchHistory: { stationIds: [101, 102] } },
      withAuth: true,
    })

    expect(result).toEqual<ServiceResult<{ searchHistoryId: number | null }>>({
      success: true,
      data: { searchHistoryId: 123 },
    })

    expect(getApiErrorMessage).not.toHaveBeenCalled()
    expect(handleApiError).not.toHaveBeenCalled()
  })

  it('呼出中に例外が発生したとき、エラー処理に委譲して失敗を渡す', async () => {
    const thrown = new Error('network down')
    mockedApiFetch.mockRejectedValue(thrown)
    mockedHandleApiError.mockReturnValue({
      success: false,
      message: '検索履歴の保存に失敗しました',
      cause: 'NETWORK',
    })

    const result = await saveSearchHistory([301, 302])

    expect(handleApiError).toHaveBeenCalledWith(thrown, {
      component: 'saveSearchHistory',
      defaultMessage: '検索履歴の保存に失敗しました',
      extraContext: { stationIds: [301, 302] },
    })

    expect(result).toEqual<ServiceResult<{ searchHistoryId: number | null }>>({
      success: false,
      message: '検索履歴の保存に失敗しました',
      cause: 'NETWORK',
    })
  })
})
