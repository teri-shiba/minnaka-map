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

      if (res.data.login !== false) {
        setUser({
          ...res.data,
          isSignedIn: true,
          isLoading: false,
        })
      }
      else {
        setUser({
          ...res.data,
          isSignedIn: false,
          isLoading: false,
        })
      }
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
  const { data, error, isLoading } = useSWR(`${baseURL}/current/user/show_status`, fetcher, { revalidateOnFocus: false })

  return {
    isLogin: data?.login !== false,
    isError: error,
    isLoading,
  }
}
