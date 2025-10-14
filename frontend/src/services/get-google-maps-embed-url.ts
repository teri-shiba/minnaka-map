import { getApiKey } from './get-api-key'

export async function getGoogleMapsEmbedUrl(query: string): Promise<string | null> {
  try {
    const result = await getApiKey('googlemaps')
    if (!result.success)
      return null

    const url = new URL('https://www.google.com/maps/embed/v1/place')
    url.search = new URLSearchParams({ key: result.data, q: query }).toString()
    return url.toString()
  }
  catch {
    return null
  }
}
