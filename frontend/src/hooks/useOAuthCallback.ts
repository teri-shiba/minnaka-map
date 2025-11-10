'use client'

import { isAxiosError } from 'axios'
import { useResetAtom } from 'jotai/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'
import { userStateAtom } from '~/state/user-state.atom'

export default function useOAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate } = useSWRConfig()
  const resetUser = useResetAtom(userStateAtom)

  const status = searchParams.get('status')
  const message = searchParams.get('message')

  useEffect(() => {
    if (!status)
      return

    const processOAuthCallback = async () => {
      if (status !== 'success') {
        resetUser()
        const errorMessage = (status === 'error' && message)
          ? decodeURIComponent(message) // メール重複判定
          : '不正なアクセスです'

        toast.error(errorMessage)

        router.replace('/', { scroll: false })
        return
      }

      try {
        await toast.promise(
          api.get('/current/user/show_status').then((response) => {
            if (response.data.login === false)
              throw new Error('ログインに失敗しました')

            return response
          }),
          {
            loading: '確認中…',
            success: 'ログインに成功しました',
          },
        )

        await mutate('/current/user/show_status')
      }
      catch (error) {
        logger(error, {
          component: 'useOAuthCallback',
          action: 'processOAuthCallback',
        })
        resetUser()

        if (!isAxiosError(error) && error instanceof Error)
          toast.error(error.message)
      }
      finally {
        router.replace('/', { scroll: false })
      }
    }

    processOAuthCallback()
  }, [status, message, mutate, resetUser, router, searchParams])
}
