import type { ProviderId } from './auth-provider'

export interface UserState {
  id: number
  name: string
  email: string
  provider: ProviderId | null
  isSignedIn: boolean
}
