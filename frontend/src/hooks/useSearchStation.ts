'use client'
import useSWR from 'swr'
import { API_ENDPOINTS } from '~/constants'
import { apiHref } from '~/utils/api-url'
import { useDebounce } from './useDebounce'

const fetcher = (url: string) => fetch(url).then(response => response.json())

export default function useSearchStation(query: string) {
  const deboucedQuery = useDebounce(query.trim(), 300)
  const { data, error, isLoading } = useSWR(
    deboucedQuery
      ? apiHref(API_ENDPOINTS.STATIONS, { q: deboucedQuery })
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
