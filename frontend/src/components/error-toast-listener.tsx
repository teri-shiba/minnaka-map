'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { ERROR_MESSAGE } from '~/constants'

export default function ErrorToastListener() {
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
