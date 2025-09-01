'use client'

import type { StepIndex } from '~/data/guide-carousel'
import { useEffect, useRef, useState } from 'react'
import { guideCarousel } from '~/data/guide-carousel'

const INTERVAL = 3000

export function useGuideCarousel() {
  const [activeIndex, setActiveIndex] = useState<StepIndex>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (guideCarousel.length <= 1)
      return

    timerRef.current = setTimeout(() => {
      setActiveIndex(currentIndex => ((currentIndex + 1) % guideCarousel.length) as StepIndex)
    }, INTERVAL)

    return () => {
      if (timerRef.current)
        clearTimeout(timerRef.current)
    }
  }, [activeIndex])

  const startSequenceFrom = (index: StepIndex) => setActiveIndex(index)

  return { activeIndex, startSequenceFrom } as const
}
