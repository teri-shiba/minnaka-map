'use server'

import { logger } from '~/lib/logger'
import { getAuthFromCookie } from './get-auth-from-cookie'

async function getAuthHeader(): Promise<HeadersInit> {
  const auth = await getAuthFromCookie()
  if (!auth)
    return {}

  return {
    'Content-Type': 'application/json',
    'access-token': auth.accessToken,
    'client': auth.client,
    'uid': auth.uid,
  }
}

export async function apiFetch<T = any>(
  path: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: any,
): Promise<T> {
  const url = `${process.env.API_BASE_URL}${path}`
  const headers = await getAuthHeader()

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`${method} ${url} failed: ${response.status} ${text}`)
    }

    return await response.json() as T
  }
  catch (error) {
    logger(error, { tags: { component: 'api-client' } })
    throw error
  }
}
