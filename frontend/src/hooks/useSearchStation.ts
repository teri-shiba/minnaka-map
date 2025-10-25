'use client'

import useSWR from 'swr'
import { useDebounce } from './useDebounce'

const fetcher = (url: string) => fetch(url).then(response => response.json())

export default function useSearchStation(query: string) {
  const debouncedQuery = useDebounce(query.trim(), 300)

  let url: string | null = null

  if (debouncedQuery) {
    const apiURL = new URL('/api/v1/stations', process.env.NEXT_PUBLIC_API_BASE_URL)
    apiURL.searchParams.set('q', debouncedQuery)
    url = apiURL.toString()
  }

  const { data, error, isLoading } = useSWR(url, fetcher, {
    dedupingInterval: 500,
    revalidateOnFocus: false,
    errorRetryCount: 2,
  })

  return {
    stations: data?.stations ?? [],
    isLoading,
    isError: error,
  }
}
