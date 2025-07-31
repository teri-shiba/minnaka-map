'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

const ERROR_MESSAGE = {
  missing_params: '検索パラメーターが不足しています',
  invalid_coordinates: '座標エラー: 無効な位置情報です',
  outside_japan: '座標エラー: 日本列島の範囲外です',
  validation_failed: '座標エラー: 検証に失敗しました',
  validation_error: '座標エラー: 予期しないエラーが発生しました',
  rate_limit_exceeded: 'アクセスが集中しています。しばらく時間をおいてお試しください。',
  server_error: 'レストラン検索サービスが一時的に利用できません。しばらく後にお試しください。',
  restaurant_fetch_failed: 'レストランデータの取得に失敗しました。条件を変えて再検索してください。',
  auth_required_favorites: 'お気に入りリストを見るにはログインが必要です',
} as const

type ErrorType = keyof typeof ERROR_MESSAGE

export default function ErrorToastHandler() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const router = useRouter()

  useEffect(() => {
    if (!error)
      return

    const displayMessage = message
      || ERROR_MESSAGE[error as ErrorType]
      || '不明なエラーが発生しました'

    toast.error(displayMessage)
    router.replace('/')
  }, [error, message, router])

  return null
}
