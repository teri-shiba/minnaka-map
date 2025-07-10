'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function usePagination() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createPageUrl = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `?${params.toString()}`
  }, [searchParams])

  const navigateToPage = useCallback((page: number) => {
    router.push(createPageUrl(page))
  }, [router, createPageUrl])

  return { createPageUrl, navigateToPage }
}
