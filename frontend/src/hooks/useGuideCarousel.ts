'use client'

import type { StepIndex } from '~/data/guide-carousel'
import { useCallback, useEffect, useRef, useState } from 'react'
import { guideCarousel } from '~/data/guide-carousel'

const INTERVAL = 3000

export function useGuideCarousel() {
  const [activeIndex, setActiveIndex] = useState<StepIndex>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const length = guideCarousel.length
    if (length <= 1) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    if (timerRef.current)
      clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setActiveIndex(currentIndex => ((currentIndex + 1) % length) as StepIndex)
    }, INTERVAL)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [activeIndex])

  const startSequenceFrom = useCallback((index: StepIndex) => setActiveIndex(index), [])

  return { activeIndex, startSequenceFrom } as const
}
