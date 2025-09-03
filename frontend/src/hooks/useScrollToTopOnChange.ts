'use client'

import { useEffect } from 'react'

interface RefLike<T extends HTMLElement> { current: T | null }

export default function useScrollToTopOnChange<T extends HTMLElement>(
  containerRef: RefLike<T>,
  depKey: unknown,
) {
  useEffect(() => {
    if (!containerRef.current)
      return

    containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }, [containerRef, depKey])
}
