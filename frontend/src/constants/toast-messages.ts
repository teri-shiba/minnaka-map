export const ERROR_MESSAGE = {
  missing_params: '検索パラメーターが不足しています',
  invalid_coordinates: '座標エラー: 無効な位置情報です',
  outside_japan: '座標エラー: 日本列島の範囲外です',
  validation_failed: '座標エラー: 検証に失敗しました',
  validation_error: '座標エラー: 予期しないエラーが発生しました',
  rate_limit_exceeded: 'アクセスが集中しています。時間をあけてから、再度お試しください。',
  server_error: 'レストラン検索サービスが一時的に利用できません。時間をあけてから、再度お試しください。',
  restaurant_fetch_failed: 'レストランデータの取得に失敗しました。時間をあけてから、再度お試しください。',
  auth_required: 'このページの閲覧にはログインが必要です',
  link_expired: 'リンクの有効期限が切れました。もう一度検索してください。',
  network_error: 'ネットワークエラーが発生しました。時間をあけてから、再度お試しください。',
  search_context_missing: '必要な情報を取得できませんでした。再検索してから、もう一度お試しください。',
  request_failed: '予期せぬエラーが発生しました',
  duplicate_email: 'このメールアドレスはすでに登録されています',
  already_confirmed: 'メールアドレスはすでに確認済みです',
} as const

export type ErrorCode = keyof typeof ERROR_MESSAGE

export const SUCCESS_MESSAGE = {
  login: 'ログインに成功しました',
  logout: 'ログアウトしました',
  email_confirmed: 'メールアドレスの認証が完了しました',
  account_deleted: 'アカウントが削除されました',
  email_sent: '認証メールを送信しました',
}

export type SuccessCode = keyof typeof SUCCESS_MESSAGE
