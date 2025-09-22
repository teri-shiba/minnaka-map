export type ProviderId = 'email' | 'google_oauth2' | 'line'

export interface AuthProvider {
  name: string
  iconImg: string
  provider: ProviderId
}
