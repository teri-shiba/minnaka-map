'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import DesktopGuideCarousel from './carousels/GuideCarousel/Desktop'
import MobileGuideCarousel from './carousels/GuideCarousel/Mobile'

export function GuideCarousel() {
  const isDesktop = useMediaQuery('(min-width: 640px)')

  return (
    <div className="section-guide">
      {isDesktop
        ? (
            <DesktopGuideCarousel className="hidden sm:flex sm:items-center sm:justify-between" />
          )
        : (
            <MobileGuideCarousel className="block sm:hidden" />
          )}
    </div>
  )
}
