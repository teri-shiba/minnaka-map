import type { LoginCredentials, SignupCredentials } from '../../types/auth'
import type { UserState } from '../../types/user'
import axios, { isAxiosError } from 'axios'
import { useAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'
import { userStateAtom } from '../lib/state/userStateAtom'

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
const frontBaseURL = process.env.NEXT_PUBLIC_FRONT_BASE_URL

function handleApiError(error: unknown, errorMessage: string): void {
  if (isAxiosError(error) && error.response?.status) {
    console.error(`API Error: ${error.message}`)
    toast.error(errorMessage)
  }
  else {
    console.error(`Unexpected Error:`, error)
    toast.error('予期しないエラーが発生しました')
  }
}

function isValidResponse(response: any): boolean {
  return response.status === 200 && response.data
}

export function useAuth() {
  const [, setUser] = useAtom(userStateAtom)
  const { mutate } = useSWRConfig()

  const resetUserState = useAtomCallback(
    useCallback(async (_get, set) => {
      const resetState: UserState = {
        id: 0,
        name: '',
        email: '',
        isSignedIn: false,
        isLoading: false,
      }
      set(userStateAtom, resetState)
      await new Promise(resolve => setTimeout(resolve, 0))
    }, []),
  )

  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      const response = await axios.get(`${apiBaseURL}/current/user`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      setUser({
        ...response.data,
        isSignedIn: true,
        isLoading: false,
      })
    }
    catch (error) {
      await resetUserState()

      if (isAxiosError(error) && error.response?.status !== 401) {
        handleApiError(error, 'ユーザー情報の取得に失敗しました')
      }
    }
  }, [setUser, resetUserState])

  const login = useCallback(async (data: LoginCredentials): Promise<void> => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
      }

      const response = await axios.post(`${apiBaseURL}/auth/sign_in`, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      if (!isValidResponse(response)) {
        await resetUserState()
        toast.error('ログインに失敗しました')
        return
      }

      await fetchUser()
      toast.success('ログインに成功しました')
    }
    catch (error) {
      handleApiError(error, 'ログインに失敗しました')
      await resetUserState()
    }
  }, [fetchUser, resetUserState])

  const signup = useCallback(async (data: SignupCredentials): Promise<void> => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        confirm_success_url: `${frontBaseURL}/`,
      }

      const response = await axios.post(`${apiBaseURL}/auth`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      if (!isValidResponse(response)) {
        await resetUserState()
        toast.error(`登録に失敗しました`)
        return
      }

      toast.success('認証メールをご確認ください')
    }
    catch (error) {
      if (isAxiosError(error) && error.response?.status) {
        const status = error.response?.status
        const errors = error.response?.data?.errors
        console.error(errors)

        if (status === 422 && errors) {
          toast.error(errors.full_messages)
        }
        else {
          toast.error('登録処理中にエラーが発生しました。')
        }
        await resetUserState()
      }
    }
  }, [resetUserState])

  const logout = useCallback(async (): Promise<void> => {
    try {
      const response = await axios.delete(`${apiBaseURL}/auth/sign_out`, {
        withCredentials: true,
      })

      if (!isValidResponse(response)) {
        toast.error('ログアウトに失敗しました')
        return
      }

      mutate(`${apiBaseURL}/current/user/show_status`)
      await resetUserState()
      toast.success('ログアウトしました')
    }
    catch (error) {
      handleApiError(error, 'ログアウトに失敗しました')
    }
  }, [mutate, resetUserState])

  return useMemo(() => ({
    resetUserState,
    signup,
    login,
    logout,
    fetchUser,
  }), [resetUserState, signup, login, logout, fetchUser])
}
