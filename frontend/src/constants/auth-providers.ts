import type { AuthProvider } from '~/types/auth-provider'

export const authProviders: readonly AuthProvider[] = [
  {
    name: 'Google',
    iconImg: '/icon_Google.webp',
    authUrl: 'google_oauth2',
  },
  {
    name: 'LINE',
    iconImg: '/icon_LINE.webp',
    authUrl: 'line',
  },
] as const
