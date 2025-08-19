import { getApiKey } from './get-api-key'

export async function getGoogleMapsEmbedUrl(query: string): Promise<string | null> {
  try {
    const apiKey = await getApiKey('googlemaps')
    const url = new URL('https://www.google.com/maps/embed/v1/place')
    url.search = new URLSearchParams({ key: apiKey, q: query }).toString()
    return url.toString()
  }
  catch {
    return null
  }
}
