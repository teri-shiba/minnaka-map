import { useAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback } from 'react'
import { toast } from 'sonner'
import useSWR, { useSWRConfig } from 'swr'
import { API_ENDPOINTS } from '~/constants'
import api from '~/lib/axios-interceptor'
import { userStateAtom } from '~/state/user-state.atom'

const appOrigin = process.env.NEXT_PUBLIC_FRONT_BASE_URL

export function useAuth() {
  const [user, setUser] = useAtom(userStateAtom)
  const resetUser = useResetAtom(userStateAtom)
  const { mutate } = useSWRConfig()

  const fetcher = async (url: string) =>
    api.get(url).then(response => response.data)

  const { error, isLoading, isValidating } = useSWR(
    API_ENDPOINTS.CURRENT_USER_STATUS,
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
        await api.post(API_ENDPOINTS.AUTH_SIGN_IN, { email, password })
        await mutate(API_ENDPOINTS.CURRENT_USER_STATUS)
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
        await api.delete(API_ENDPOINTS.AUTH_SIGN_OUT)
        mutate(API_ENDPOINTS.CURRENT_USER_STATUS)
        resetUser()
        sessionStorage.removeItem('pendingStationIds')
        sessionStorage.removeItem('pendingSearchHistoryId')
        // TODO: ErrorToastHandler にまとめることで、トースト発火→リダイレクトという変な挙動をなくす
        toast.success('ログアウトしました')
      }
      catch {
        resetUser()
      }
    },
    [mutate, resetUser],
  )

  const deleteAccount = useCallback(
    async () => {
      try {
        await api.delete('/auth')

        await mutate(API_ENDPOINTS.CURRENT_USER_STATUS)
        resetUser()
        sessionStorage.removeItem('pendingStationIds')
        sessionStorage.removeItem('pendingSearchHistoryIds')

        toast.success('アカウントが削除されました')
        // TODO: return 処理を後でリファクタリング
        return { success: true }
      }
      catch (error) {
        console.error('アカウント削除失敗:', error)
        toast.error('アカウントの削除に失敗しました')
        // TODO: return 処理を後でリファクタリング
        return { success: false, error }
      }
    },
    [mutate, resetUser],
  )

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
