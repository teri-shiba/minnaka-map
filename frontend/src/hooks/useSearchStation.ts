'use client'
import useSWR from 'swr'
import { API_ENDPOINTS } from '~/constants'
import { apiHref } from '~/utils/api-url'
import { useDebounce } from './useDebounce'

const fetcher = (url: string) => fetch(url).then(response => response.json())

export default function useSearchStation(query: string) {
  const debouncedQuery = useDebounce(query.trim(), 300)
  const { data, error, isLoading } = useSWR(
    debouncedQuery
      ? apiHref(API_ENDPOINTS.STATIONS, { q: debouncedQuery })
      : null,
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
