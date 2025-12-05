'use client'

import type { ErrorCode, SuccessCode } from '~/constants/toast-messages'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '~/constants/toast-messages'

export default function ToastListener() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const error = searchParams.get('error')
  const success = searchParams.get('success')

  const isKnownError = (value: string): value is ErrorCode => value in ERROR_MESSAGE
  const isKnownSuccess = (value: string): value is SuccessCode => value in SUCCESS_MESSAGE

  useEffect(() => {
    if (error) {
      if (!isKnownError(error)) {
        router.replace('/')
        return
      }

      toast.error(ERROR_MESSAGE[error])
      const cleanupURL = error === 'duplicate_email' || error === 'already_confirmed' ? pathname : '/'
      router.replace(cleanupURL)
      return
    }

    if (success) {
      if (!isKnownSuccess(success)) {
        router.replace('/')
        return
      }

      toast.success(SUCCESS_MESSAGE[success])
      const cleanupURL = success === 'email_sent' || success === 'email_confirmed' ? pathname : '/'
      router.replace(cleanupURL)
    }
  }, [error, success, router, pathname])

  return null
}
