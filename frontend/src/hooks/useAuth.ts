import { useAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback } from 'react'
import { toast } from 'sonner'
import useSWR, { useSWRConfig } from 'swr'
import api from '~/lib/api'
import { userStateAtom } from '~/state/user-state.atom'

const appOrigin = process.env.NEXT_PUBLIC_FRONT_BASE_URL

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
        toast.success('ログアウトしました')
      }
      catch {
        resetUser()
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
  }
}
