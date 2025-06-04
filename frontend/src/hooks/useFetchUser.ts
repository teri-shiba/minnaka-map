'use client'

import useSWR from 'swr'
import api from '~/lib/api'

export function useFetchUser() {
  const fetcher = async (url: string) =>
    api.get(url).then(response => response.data)

  const { data, error, mutate } = useSWR('/current/user/show_status', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  return {
    user: data?.login !== false ? data : null,
    isLoading: !error && !data,
    isError: !!error,
    mutate,
  }
}
