import { getApiKey } from '~/services/get-api-key'
import { getGoogleMapsEmbedUrl } from '~/services/get-google-maps-embed-url'

jest.mock('~/services/get-api-key', () => ({
  getApiKey: jest.fn(),
}))

const mockedGetApiKey = jest.mocked(getApiKey)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('getGoogleMapsEmbedUrl', () => {
  it('api key が取得できたら正しい url を返す', async () => {
    mockedGetApiKey.mockResolvedValue('FAKE_API_KEY')
    const result = await getGoogleMapsEmbedUrl('tokyo station')

    expect(mockedGetApiKey).toHaveBeenCalledWith('googlemaps')
    expect(result).not.toBeNull()

    const url = new URL(result as string)
    expect(url.origin).toBe('https://www.google.com')
    expect(url.pathname).toBe('/maps/embed/v1/place')
    expect(url.searchParams.get('key')).toBe('FAKE_API_KEY')
    expect(url.searchParams.get('q')).toBe('tokyo station')
  })

  it('クエリに特殊文字が含まれていても q として渡される', async () => {
    mockedGetApiKey.mockResolvedValue('K')
    const query = '東京 タワー & cafe'
    const result = await getGoogleMapsEmbedUrl(query)
    const url = new URL(result as string)

    expect(url.searchParams.get('q')).toBe(query)
  })

  it('api key 取得で例外が発生したら null を返す', async () => {
    mockedGetApiKey.mockRejectedValue(new Error('failure'))
    const result = await getGoogleMapsEmbedUrl('tokyo cafe')

    expect(result).toBeNull()
  })
})
