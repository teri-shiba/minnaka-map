import axios, { isAxiosError } from 'axios'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'
import { userStateAtom } from '../lib/state/userStateAtom'

function handleApiError(e: unknown, errorMessage: string) {
  if (isAxiosError(e) && e.response?.status) {
    console.error(`API Error: ${e.message}`)
    toast.error(errorMessage)
  }
  else {
    console.error(`Unexpected Error:`, e)
    toast.error('予期しないエラーが発生しました')
  }
}

function isValidResponse(res: any) {
  return res.status === 200 && res.data
}

export function useAuth() {
  const [, setUser] = useAtom(userStateAtom)
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
  const { mutate } = useSWRConfig()

  const resetUserState = () => {
    setUser({
      id: 0,
      name: '',
      email: '',
      isSignedIn: false,
      isLoading: false,
    })
  }

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${baseURL}/current/user`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      setUser({
        ...res.data,
        isSignedIn: true,
        isLoading: false,
      })
    }
    catch (e) {
      resetUserState()

      if (isAxiosError(e) && e.response?.status !== 401) {
        handleApiError(e, 'ユーザー情報の取得に失敗しました')
      }
    }
  }

  const login = async (data: { email: string, password: string }) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
      }

      const res = await axios.post(`${baseURL}/auth/sign_in`, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      if (!isValidResponse(res)) {
        resetUserState()
        toast.error('ログインに失敗しました')
        return
      }

      await fetchUser()
      toast.success('ログインに成功しました')
    }
    catch (e) {
      handleApiError(e, 'ログインに失敗しました')
      resetUserState()
    }
  }

  const logout = async () => {
    try {
      const res = await axios.delete(`${baseURL}/auth/sign_out`, {
        withCredentials: true,
      })

      if (!isValidResponse(res)) {
        toast.error('ログアウトに失敗しました')
        return
      }

      mutate(`${baseURL}/current/user/show_status`)
      resetUserState()
      toast.success('ログアウトしました')
    }
    catch (e) {
      handleApiError(e, 'ログアウトに失敗しました')
    }
  }

  return {
    login,
    logout,
    fetchUser,
  }
}
