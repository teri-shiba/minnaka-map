'use server'

import { cookies } from 'next/headers'
import { logger } from '~/lib/logger'

interface AuthData {
  accessToken: string
  client: string
  uid: string
}

function isValidAuthField(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

export async function getAuthFromCookie(): Promise<AuthData | null> {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth_cookie')?.value
    if (!authCookie)
      return null

    const decoded = decodeURIComponent(authCookie)
    const parsed = JSON.parse(decoded) as Record<string, unknown>

    const accessToken = parsed['access-token']
    const client = parsed.client
    const uid = parsed.uid

    if (!isValidAuthField(accessToken)
      || !isValidAuthField(client)
      || !isValidAuthField(uid)
    ) {
      logger(new Error('認証Cookieが破損しています'), {
        component: 'getAuthFromCookie',
        extra: {
          errorType: 'corrupted_cookie',
          hasAccessToken: isValidAuthField(accessToken),
          hasClient: isValidAuthField(client),
          hasUid: isValidAuthField(uid),
        },
      })
      return null
    }

    return { accessToken, client, uid }
  }
  catch (error) {
    logger(error, { component: 'getAuthFromCookie' })
    return null
  }
}
