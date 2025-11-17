import { getAuthFromCookie } from '~/services/get-auth-from-cookie'

interface AuthInfo {
  accessToken: string
  client: string
  uid: string
}

export const mockAuthInfo: AuthInfo = {
  accessToken: 'token-123',
  client: 'client-123',
  uid: 'uid-123',
}

export function setupAuthMock(auth: AuthInfo | null = mockAuthInfo) {
  vi.mocked(getAuthFromCookie).mockResolvedValue(auth)
}

export function setupUnauthorized() {
  vi.mocked(getAuthFromCookie).mockResolvedValueOnce(null)
}
