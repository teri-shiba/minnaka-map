import type { AxiosResponse } from 'axios'
import axios, { isAxiosError } from 'axios'
import { useAtom } from 'jotai'
import useSWR from 'swr'
import { userStateAtom } from '../lib/state/userStateAtom'

export default function useUser() {
  const [, setUser] = useAtom(userStateAtom)

  const fetcher = async (url: string) => {
    try {
      const res: AxiosResponse = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      const userData = {
        ...res.data,
        isSignedIn: res.data.login !== false,
        isLoading: false,
      }

      setUser(userData)
      return res.data
    }
    catch (e) {
      if (isAxiosError(e) && e.response?.status) {
        console.error(`API Error: ${e.message}`)
      }
      throw e
    }
  }

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
  const { data, error, isLoading } = useSWR(`${baseURL}/current/user/show_status`, fetcher, { revalidateOnFocus: false, errorRetryCount: 0 })

  return {
    isLogin: data?.login !== false,
    isError: error,
    isLoading,
  }
}
