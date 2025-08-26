import type { ProviderId } from '~/types/auth-provider'

export function getDeleteDescription(provider: ProviderId | null): string {
  switch (provider) {
    case 'email':
      return 'メールアドレスでログイン中です。'
    case 'google_oauth2':
      return 'Googleアカウントでログイン中です。'
    case 'line':
      return 'LINEアカウントでログイン中です。'
    default:
      return ''
  }
}
