'use client'

import type { CarouselData, CarouselResult } from '~/types/carousel'
import { useCallback, useEffect, useRef, useState } from 'react'

interface CarouselOptions {
  initialStep?: number
  autoPlay?: boolean
  interval?: number
}

export function useCarousel(
  carouselData: CarouselData[],
  { initialStep = 1, autoPlay = true, interval = 3000 }: CarouselOptions = {},
): CarouselResult {
  const [activeStep, setActiveStep] = useState(initialStep)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const getNextStep = useCallback((currentStep: number) => {
    const currentIndex = carouselData.findIndex(data => data.id === currentStep)
    return currentIndex === carouselData.length - 1
      ? carouselData[0].id
      : carouselData[currentIndex + 1].id
  }, [carouselData])

  const startSequenceFrom = useCallback((stepId: number) => {
    setActiveStep(stepId)
  }, [])

  useEffect(() => {
    if (!autoPlay)
      return

    timerRef.current = setTimeout(() => {
      setActiveStep(current => getNextStep(current))
    }, interval)

    return () => {
      if (timerRef.current)
        clearTimeout(timerRef.current)
    }
  }, [autoPlay, activeStep, interval, getNextStep])

  return {
    activeStep,
    startSequenceFrom,
  }
}
