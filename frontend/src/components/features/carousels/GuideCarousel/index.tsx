'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import DesktopGuideCarousel from './Desktop'
import MobileGuideCarousel from './Mobile'

export default function GuideCarousel() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <>
      {isDesktop ? <DesktopGuideCarousel /> : <MobileGuideCarousel />}
    </>

  )
}
