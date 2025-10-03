import { getAuthFromCookie } from '~/services/get-auth-from-cookie'
import 'server-only'

export async function addAuthHeaders(headers: Headers): Promise<void> {
  const auth = await getAuthFromCookie()
  if (!auth)
    return

  headers.set('access-token', auth.accessToken)
  headers.set('client', auth.client)
  headers.set('uid', auth.uid)
}
