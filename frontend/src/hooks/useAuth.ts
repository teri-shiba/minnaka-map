'use client'

import { useAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback } from 'react'
import { toast } from 'sonner'
import useSWR, { useSWRConfig } from 'swr'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'
import { userStateAtom } from '~/state/user-state.atom'

const appOrigin = process.env.NEXT_PUBLIC_FRONT_BASE_URL

type DeleteAccountResult = { success: true } | { success: false, error: unknown }

export function useAuth() {
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
        toast.success('認証メールをご確認ください')
      }
      catch {
        resetUser()
      }
    },
    [resetUser],
  )

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await api.post('/auth/sign_in', { email, password })
        await mutate('/current/user/show_status')
        toast.success('ログインに成功しました')
      }
      catch {
        resetUser()
      }
    },
    [mutate, resetUser],
  )

  const logout = useCallback(
    async () => {
      try {
        await api.delete('/auth/sign_out')
        mutate('/current/user/show_status')
        resetUser()
        sessionStorage.removeItem('pendingStationIds')
        sessionStorage.removeItem('pendingSearchHistoryId')
        toast.success('ログアウトしました')
      }
      catch {
        resetUser()
      }
    },
    [mutate, resetUser],
  )

  const deleteAccount = useCallback(async (): Promise<DeleteAccountResult> => {
    try {
      await api.delete('/auth')
      await mutate('/current/user/show_status')
      resetUser()
      sessionStorage.removeItem('pendingStationIds')
      sessionStorage.removeItem('pendingSearchHistoryId')

      toast.success('アカウントが削除されました')
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
      toast.error('アカウントの削除に失敗しました')
      return { success: false, error }
    }
  }, [mutate, resetUser, user?.id, user?.provider])

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
