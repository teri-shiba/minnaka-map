'use client'

import type { ErrorCode, SuccessCode } from '~/constants/toast-messages'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '~/constants/toast-messages'

export default function ToastListener() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const message = searchParams.get('message')

  useEffect(() => {
    if (error) {
      const displayMessage = message
        || (error in ERROR_MESSAGE ? ERROR_MESSAGE[error as ErrorCode] : null)
        || '予期せぬエラーが発生しました'

      toast.error(displayMessage)
      router.replace('/')
      return
    }

    if (success) {
      const displayMessage = success in SUCCESS_MESSAGE
        ? SUCCESS_MESSAGE[success as SuccessCode]
        : '操作が完了しました'

      toast.success(displayMessage)
      router.replace('/')
    }
  }, [error, success, message, router])

  return null
}
