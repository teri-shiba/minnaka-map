export function getDeleteDescription(provider: string): string {
  switch (provider) {
    case 'email':
      return '確認のため、登録中のメールアドレスを入力してください。'
    case 'google_oauth2':
      return 'Google認証を行った後、アカウントをを削除します。'
    case 'line':
      return 'LINE認証を行った後、アカウントをを削除します。'
    default:
      return 'アカウントの削除を実行します。'
  }
}
