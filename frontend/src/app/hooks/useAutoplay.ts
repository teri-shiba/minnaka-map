import type { CarouselData } from '../lib/data/carouselData'
import { useEffect } from 'react'

interface AutoplayProps {
  isPlaying: boolean
  activeStep: number
  setActiveStep: (step: number) => void
  carouselData: CarouselData[]
  interval?: number
}

export function useAutoplay({
  isPlaying,
  activeStep,
  setActiveStep,
  carouselData,
  interval = 3000,
}: AutoplayProps,
) {
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        const currentIndex = carouselData.findIndex(data => data.id === activeStep)
        if (currentIndex === carouselData.length - 1) {
          setActiveStep(1)
        }
        else {
          setActiveStep(carouselData[currentIndex + 1].id)
        }
      }, interval)

      return () => clearTimeout(timer)
    }
  }, [activeStep, isPlaying, carouselData, setActiveStep, interval])
}
