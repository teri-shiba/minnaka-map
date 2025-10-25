'use client'

import type { RefObject } from 'react'
import { useAnimationControls } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DRAWER_RATIO } from '~/constants'

interface DrawerScrollLimits {
  top: number
  bottom: number
}

interface UseDrawerControllerReturn {
  contentRef: RefObject<HTMLDivElement | null>
  scrollLimits: DrawerScrollLimits
  controls: ReturnType<typeof useAnimationControls>
  resetPosition: () => void
}

function calcDrawerHeight(viewportHeight: number): number {
  return viewportHeight * DRAWER_RATIO
}

function getViewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight
}

export default function useDrawerController(
  enabled: boolean,
): UseDrawerControllerReturn {
  const contentRef = useRef<HTMLDivElement>(null)
  const [scrollLimits, setScrollLimits] = useState<DrawerScrollLimits>({ top: 0, bottom: 0 })
  const controls = useAnimationControls()

  const calcScrollLimits = useCallback(() => {
    if (!enabled || !contentRef.current)
      return

    const contentHeight = contentRef.current.offsetHeight
    const viewportHeight = getViewportHeight()
    const drawerHeight = calcDrawerHeight(viewportHeight)

    const scrollableDistance = Math.max(0, contentHeight - drawerHeight)

    setScrollLimits({
      top: -scrollableDistance,
      bottom: 0,
    })
  }, [enabled])

  useEffect(() => {
    if (!enabled || !contentRef.current)
      return

    // 初回計算
    const rafId = requestAnimationFrame(calcScrollLimits)

    // コンテンツサイズの変更を監視
    const resizeObserver = new ResizeObserver(calcScrollLimits)
    resizeObserver.observe(contentRef.current)

    // ウィンドウリサイズを監視
    window.addEventListener('resize', calcScrollLimits)

    // クリーンアップ
    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', calcScrollLimits)
    }
  }, [enabled, calcScrollLimits])

  const resetPosition = useCallback(() => {
    if (!enabled)
      return

    controls.start({ y: 0 })
  }, [enabled, controls])

  return {
    contentRef,
    scrollLimits,
    controls,
    resetPosition,
  }
}
