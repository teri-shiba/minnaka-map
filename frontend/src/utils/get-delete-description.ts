export function getDeleteDescription(provider: string): string {
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
