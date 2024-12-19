import type { AxiosResponse } from 'axios'
import axios, { isAxiosError } from 'axios'
import useSWR from 'swr'

export default function useUser() {
  const fetcher = async (url: string) => {
    try {
      const res: AxiosResponse = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

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
  const { data, error, isLoading } = useSWR(`${baseURL}/current/user/show_status`, fetcher)

  return {
    isLogin: data?.login !== false,
    isError: error,
    isLoading,
  }
}
