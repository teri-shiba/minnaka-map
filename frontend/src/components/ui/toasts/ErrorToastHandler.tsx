'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

const ERROR_MESSAGE = {
  missing_params: '検索パラメーターが不足しています',
} as const

type ErrorType = keyof typeof ERROR_MESSAGE

export default function ErrorToastHandler() {
  const params = useSearchParams()
  const error = params.get('error')
  const message = params.get('message')
  console.log(error, message)
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
