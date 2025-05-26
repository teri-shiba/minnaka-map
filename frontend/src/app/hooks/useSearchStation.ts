'use client'
import useSWR from 'swr'
import { useDebounce } from './useDebounce'

const fetcher = (url: string) => fetch(url).then(response => response.json())

export default function useSearchStation(query: string) {
  const deboucedQuery = useDebounce(query.trim(), 300)
  const baseApiURL = process.env.NEXT_PUBLIC_API_BASE_URL
  const { data, error, isLoading } = useSWR(
    deboucedQuery ? `${baseApiURL}/stations?q=${deboucedQuery}` : null,
    fetcher,
    {
      dedupingInterval: 500,
      revalidateOnFocus: false,
      errorRetryCount: 2,
    },
  )

  return {
    stations: data?.stations ?? [],
    isLoading,
    isError: error,
  }
}
