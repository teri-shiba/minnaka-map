import type { ServiceResult } from '~/types/service-result'
import { apiFetchAuth, handleApiError } from '~/services/api-client'
import { saveSearchHistory } from '~/services/save-search-history'
import { getApiErrorMessage, isApiSuccess } from '~/types/api-response'

jest.mock('~/services/api-client', () => ({
  apiFetchAuth: jest.fn(),
  handleApiError: jest.fn(),
}))

jest.mock('~/types/api-response', () => ({
  isApiSuccess: jest.fn(),
  getApiErrorMessage: jest.fn(),
}))

const mockedApiFetchAuth = jest.mocked(apiFetchAuth)
const mockedHandleApiError = jest.mocked(handleApiError)
const mockedIsApiSuccess = jest.mocked(isApiSuccess)
const mockedGetApiErrorMessage = jest.mocked(getApiErrorMessage)

describe('save-search-history', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('API が成功を示したとき、取得した id を searchHistoryId として渡す', async () => {
    mockedApiFetchAuth.mockResolvedValue({ data: { id: 123 } })
    mockedIsApiSuccess.mockReturnValue(true)

    const result = await saveSearchHistory([101, 102])

    expect(apiFetchAuth).toHaveBeenCalledWith('search_histories', {
      method: 'POST',
      body: { searchHistory: { stationIds: [101, 102] } },
    })

    expect(result).toEqual<ServiceResult<{ searchHistoryId: number | null }>>({
      success: true,
      data: { searchHistoryId: 123 },
    })

    expect(getApiErrorMessage).not.toHaveBeenCalled()
    expect(handleApiError).not.toHaveBeenCalled()
  })

  it('API が失敗を示したとき、取得したエラーメッセージを設定して返す ', async () => {
    const apiResponse = { error: [{ message: '保存に失敗しました' }] }
    mockedApiFetchAuth.mockResolvedValue(apiResponse)
    mockedIsApiSuccess.mockReturnValue(false)
    mockedGetApiErrorMessage.mockReturnValue('保存に失敗しました')

    const result = await saveSearchHistory([201])

    expect(apiFetchAuth).toHaveBeenCalledWith('search_histories', {
      method: 'POST',
      body: { searchHistory: { stationIds: [201] } },
    })
    expect(getApiErrorMessage).toHaveBeenCalledWith(apiResponse)
    expect(result).toEqual<ServiceResult<{ searchHistoryId: number | null }>>({
      success: false,
      message: '保存に失敗しました',
      cause: 'REQUEST_FAILED',
    })
    expect(handleApiError).not.toHaveBeenCalled()
  })

  it('呼出中に例外が発生したとき、エラー処理に委譲して失敗を渡す', async () => {
    const thrown = new Error('network down')
    mockedApiFetchAuth.mockRejectedValue(thrown)
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
