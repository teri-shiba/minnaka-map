'use client'

import useSWR from 'swr'
import api from '~/lib/api'

export function useFetchUser() {
  const fetcher = (url: string) => api.get(url).then(response => response.data)

  const { data: user, error, mutate } = useSWR('/current/user', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  return {
    user,
    isLoading: !error && !user,
    isError: !!error,
    mutate,
  }
}
