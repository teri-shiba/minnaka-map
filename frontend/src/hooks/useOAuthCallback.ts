'use client'

import { useResetAtom } from 'jotai/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'
import { API_ENDPOINTS } from '~/constants'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'
import { userStateAtom } from '~/state/user-state.atom'

export default function useOAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { mutate } = useSWRConfig()
  const resetUser = useResetAtom(userStateAtom)

  const status = searchParams.get('status')
  const message = searchParams.get('message')

  useEffect(() => {
    if (!status)
      return

    const handleOAuthCallback = async () => {
      if (status === 'success') {
        try {
          await toast.promise(
            api.get(API_ENDPOINTS.CURRENT_USER_STATUS)
              .then((response) => {
                if (response.data.login === false) {
                  throw new Error('未ログイン')
                }
                return response
              }),
            {
              loading: '認証中…',
              success: 'ログインに成功しました',
              error: '認証に失敗しました',
            },
          )
          await mutate(API_ENDPOINTS.CURRENT_USER_STATUS)
        }
        catch (error) {
          logger(error, { component: 'handleOAuthCallback' })
          resetUser()
          toast.error('ログインの検証に失敗しました')
        }
        router.replace(pathname, { scroll: false })
      }
      else {
        resetUser()
        const errorMessage = (status === 'error' && message)
          ? decodeURIComponent(message)
          : '不正なアクセスです'
        toast.error(errorMessage)
        router.replace(pathname, { scroll: false })
      }
    }

    handleOAuthCallback()
  }, [status, message, mutate, resetUser, router, pathname])
}
