import { getApiKey } from '~/services/get-api-key'
import { getGoogleMapsEmbedUrl } from '~/services/get-google-maps-embed-url'

vi.mock('~/services/get-api-key', () => ({
  getApiKey: vi.fn(),
}))

const mockedGetApiKey = vi.mocked(getApiKey)

describe('getGoogleMapsEmbedUrl', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('API キー取得で例外が発生したとき、null を返す', async () => {
    mockedGetApiKey.mockRejectedValue(new Error('failure'))

    const result = await getGoogleMapsEmbedUrl('tokyo cafe')

    expect(result).toBeNull()
  })

  it('API キー取得に失敗したとき、null を返す', async () => {
    mockedGetApiKey.mockRejectedValue({
      success: false,
      message: 'failed',
    })

    const result = await getGoogleMapsEmbedUrl('tokyo cafe')

    expect(result).toBeNull()
  })

  it('API キーが取得できたとき、正しい url を返す', async () => {
    mockedGetApiKey.mockResolvedValue({
      success: true,
      data: 'API_KEY',
    })

    const result = await getGoogleMapsEmbedUrl('tokyo station')

    expect(mockedGetApiKey).toHaveBeenCalledTimes(1)
    expect(mockedGetApiKey).toHaveBeenCalledWith('googlemaps')
    expect(result).not.toBeNull()

    const url = new URL(result as string)
    expect(url.origin).toBe('https://www.google.com')
    expect(url.pathname).toBe('/maps/embed/v1/place')
    expect(url.searchParams.get('key')).toBe('API_KEY')
    expect(url.searchParams.get('q')).toBe('tokyo station')
  })

  it('クエリに特殊文字が含まれていても q として渡される', async () => {
    mockedGetApiKey.mockResolvedValue({
      success: true,
      data: 'API_KEY',
    })
    const query = '東京 タワー & cafe'

    const result = await getGoogleMapsEmbedUrl(query)

    const url = new URL(result as string)
    expect(url.searchParams.get('q')).toBe(query)
  })
})
