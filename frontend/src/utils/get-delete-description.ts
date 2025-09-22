import type { ProviderId } from '~/types/auth-provider'

const messages = {
  email: 'メールアドレスでログイン中です。',
  google_oauth2: 'Googleアカウントでログイン中です。',
  line: 'LINEアカウントでログイン中です。',
} as const satisfies Record<ProviderId, string>

export function getDeleteDescription(provider: ProviderId | null): string {
  return provider ? messages[provider] : ''
}
