'use client'

import type { ServiceCause } from '~/types/service-result'
import { isAxiosError } from 'axios'
import { useResetAtom } from 'jotai/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useSWRConfig } from 'swr'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'
import { userStateAtom } from '~/state/user-state.atom'
import { mapCauseToErrorCode } from '~/utils/map-cause-to-error-code'

export default function useOAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate } = useSWRConfig()
  const resetUser = useResetAtom(userStateAtom)

  const success = searchParams.get('success')
  const error = searchParams.get('error')

  useEffect(() => {
    if (success !== 'login' && !error)
      return

    const processOAuthCallback = async () => {
      if (error) {
        resetUser()
        return
      }

      try {
        await api.get('/current/user/show_status').then((response) => {
          if (response.data.login === false)
            throw new Error('ログインに失敗しました')

          return response
        })

        await mutate('/current/user/show_status')
      }
      catch (error) {
        logger(error, {
          component: 'useOAuthCallback',
          action: 'processOAuthCallback',
        })
        resetUser()

        if (!isAxiosError(error) && error instanceof Error) {
          router.replace(`/?error=${encodeURIComponent(error.message)}`)
        }
        else {
          const cause = (error as { cause?: ServiceCause })?.cause ?? 'NETWORK'
          const errorCode = mapCauseToErrorCode(cause)
          router.replace(`/?error=${errorCode}`)
        }
      }
    }

    processOAuthCallback()
  }, [success, error, mutate, resetUser, router])
}
