'use client'

import type { ServiceCause } from '~/types/service-result'
import { useAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { toast } from 'sonner'
import useSWR, { useSWRConfig } from 'swr'
import { SUCCESS_MESSAGE } from '~/constants/toast-messages'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'
import { userStateAtom } from '~/state/user-state.atom'
import { mapCauseToErrorCode } from '~/utils/map-cause-to-error-code'

const appOrigin = process.env.NEXT_PUBLIC_FRONT_BASE_URL

type DeleteAccountResult = { success: true } | { success: false, error: unknown }

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useAtom(userStateAtom)
  const resetUser = useResetAtom(userStateAtom)
  const { mutate } = useSWRConfig()

  const fetcher = async (url: string) =>
    api.get(url).then(response => response.data)

  const { error, isLoading, isValidating } = useSWR(
    '/current/user/show_status',
    fetcher,
    {
      onSuccess: (data) => {
        if (data.login === false) {
          resetUser()
        }
        else {
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            provider: data.provider,
            isSignedIn: true,
          })
        }
      },
      onError: () => {
        resetUser()
      },
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    },
  )

  const loading = isLoading || isValidating

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        await api.post('/auth', {
          name,
          email,
          password,
          confirm_success_url: appOrigin,
        })
        router.replace(`${pathname}?success=email_sent`)
      }
      catch (error) {
        resetUser()
        const cause = (error as { cause?: ServiceCause })?.cause ?? 'NETWORK'
        const errorCode = mapCauseToErrorCode(cause)
        router.replace(`/?error=${errorCode}`)
      }
    },
    [resetUser, router, pathname],
  )

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await api.post('/auth/sign_in', { email, password })
        await mutate('/current/user/show_status')
        router.replace('/?success=login')
      }
      catch (error) {
        resetUser()
        const cause = (error as { cause?: ServiceCause })?.cause ?? 'NETWORK'
        const errorCode = mapCauseToErrorCode(cause)
        router.replace(`/?error=${errorCode}`)
      }
    },
    [mutate, resetUser, router],
  )

  const logout = useCallback(
    async () => {
      try {
        await api.delete('/auth/sign_out')
        sessionStorage.removeItem('pendingStationIds')
        resetUser()

        toast.success(SUCCESS_MESSAGE.logout)
        void mutate('/current/user/show_status')

        router.replace('/')
      }
      catch (error) {
        resetUser()
        const cause = (error as { cause?: ServiceCause })?.cause ?? 'NETWORK'
        const errorCode = mapCauseToErrorCode(cause)
        router.replace(`/?error=${errorCode}`)
      }
    },
    [mutate, resetUser, router],
  )

  const deleteAccount = useCallback(async (): Promise<DeleteAccountResult> => {
    try {
      await api.delete('/auth')
      sessionStorage.removeItem('pendingStationIds')
      resetUser()

      await mutate('/current/user/show_status')
      router.replace('/?success=account_deleted')
      return { success: true }
    }
    catch (error) {
      logger(error, {
        component: 'useAuth',
        action: 'deleteAccount',
        extra: {
          userId: user?.id,
          provider: user?.provider ?? 'unknown',
        },
      })
      const cause = (error as { cause?: ServiceCause })?.cause ?? 'NETWORK'
      const errorCode = mapCauseToErrorCode(cause)
      router.replace(`/?error=${errorCode}`)
      return { success: false, error }
    }
  }, [mutate, resetUser, user?.id, user?.provider, router])

  return {
    user,
    isLoading: loading,
    error,
    signup,
    login,
    logout,
    deleteAccount,
  }
}
