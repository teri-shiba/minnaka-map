'use client'

import { useAnimationControls } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DRAWER_RATIO } from '~/constants'

const drawerPxFromViewport = (viewportHeight: number) => viewportHeight * DRAWER_RATIO

export default function useDrawerController(enabled: boolean) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [dragConstraints, setDragConstraints] = useState({ top: 0, bottom: 0 })
  const controls = useAnimationControls()

  const measureDrawerPx = useCallback(() => {
    const vh = window.visualViewport?.height ?? window.innerHeight
    return drawerPxFromViewport(vh)
  }, [])

  const recalc = useCallback(() => {
    if (!enabled || !contentRef.current)
      return

    const contentHeight = contentRef.current.offsetHeight
    const modalViewHeight = measureDrawerPx()
    const dragDistance = Math.max(0, contentHeight - modalViewHeight)

    setDragConstraints({ top: -dragDistance, bottom: 0 })
  }, [enabled, measureDrawerPx])

  useEffect(() => {
    if (!enabled || !contentRef.current)
      return

    const resizeObserver = new ResizeObserver(recalc)
    resizeObserver.observe(contentRef.current)
    window.addEventListener('resize', recalc)
    const raf = requestAnimationFrame(recalc)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', recalc)
      cancelAnimationFrame(raf)
    }
  }, [enabled, recalc])

  const resetPosition = useCallback(() => {
    if (!enabled)
      return

    controls.start({ y: 0 })
  }, [enabled, controls])

  return { contentRef, dragConstraints, controls, resetPosition }
}
