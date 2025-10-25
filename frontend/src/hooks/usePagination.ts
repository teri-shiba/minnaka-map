'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface UsePaginationReturn {
  readonly createPageUrl: (page: number) => string
  readonly navigateToPage: (page: number) => void
}

export function usePagination(): UsePaginationReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createPageUrl = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    return `?${params}`
  }, [searchParams])

  const navigateToPage = useCallback((page: number) => {
    router.push(createPageUrl(page))
  }, [router, createPageUrl])

  return { createPageUrl, navigateToPage }
}
