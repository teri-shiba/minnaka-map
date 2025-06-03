import type { CarouselData } from '~/lib/data/carouselData'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseCrouselOptions {
  initialStep?: number
  autoPlay?: boolean
  interval?: number
}

interface UseCarouselResult {
  activeStep: number
  isPlaying: boolean
  startSequenceFrom: (stepId: number) => void
  togglePlayState: (state?: boolean) => void
}

export function useCarousel(
  carouselData: CarouselData[],
  options: UseCrouselOptions = {},
): UseCarouselResult {
  const {
    initialStep = 1,
    autoPlay = true,
    interval = 3000,
  } = options

  // 状態管理
  const [activeStep, setActiveStep] = useState(initialStep)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  // タイマーIDの参照を保持
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 次のステップを計算する関数
  const getNextStep = useCallback((currentStep: number) => {
    const currentIndex = carouselData.findIndex(data => data.id === currentStep)
    return currentIndex === carouselData.length - 1
      ? carouselData[0].id
      : carouselData[currentIndex + 1].id
  }, [carouselData])

  // タイマーをクリアする関数
  const clearCarouselTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 特定のステップからシーケンスを開始する関数
  const startSequenceFrom = useCallback((stepId: number) => {
    setActiveStep(stepId)
    setIsPlaying(true)
  }, [])

  // 再生状態を切り替える関数
  const togglePlayState = useCallback((state?: boolean) => {
    setIsPlaying(prev => typeof state !== 'undefined' ? state : !prev)
  }, [])

  // タイマーを使用して自動再生を制御するエフェクト
  useEffect(() => {
    if (!isPlaying)
      return

    // タイマーをセットアップ
    timerRef.current = setTimeout(() => {
      setActiveStep(current => getNextStep(current))
    }, interval)

    // クリーンアップ関数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [activeStep, isPlaying, interval, getNextStep, clearCarouselTimer])

  return {
    activeStep,
    isPlaying,
    startSequenceFrom,
    togglePlayState,
  }
}
