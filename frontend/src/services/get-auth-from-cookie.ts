'use server'

import { cookies } from 'next/headers'
import { logger } from '~/lib/logger'

interface AuthData {
  accessToken: string
  client: string
  uid: string
}

export async function getAuthFromCookie(): Promise<AuthData | null> {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth_cookie')?.value

    if (!authCookie) {
      return null
    }

    const decodeValue = decodeURIComponent(authCookie)
    const authData = JSON.parse(decodeValue)

    const accessToken = authData['access-token']
    const client = authData.client
    const uid = authData.uid

    if (!accessToken || !client || !uid) {
      logger(new Error('認証Cookieが破損しています'), {
        tags: {
          component: 'getAuthFromCookie',
          error_type: 'corrupted_cookie',
        },
        extra: {
          hasAccessToken: !!accessToken,
          hasClient: !!client,
          hasUid: !!uid,
        },
      })
      return null
    }

    return { accessToken, client, uid }
  }
  catch (error) {
    logger(error, { tags: { component: 'getAuthFromCookie' } })
    return null
  }
}
