'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import DesktopGuideCarousel from './carousels/DesktopGuideCarousel'
import MobileGuideCarousel from './carousels/MobileGuideCarousel'

export function GuideCarousel() {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  return (
    <>
      {isDesktop ? <DesktopGuideCarousel /> : <MobileGuideCarousel />}
    </>

  )
}
