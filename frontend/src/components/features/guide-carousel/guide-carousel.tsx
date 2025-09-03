'use client'

import { guideCarousel } from '~/data/guide-carousel'
import { useGuideCarousel } from '~/hooks/useGuideCarousel'
import GuideDescription from './guide-description'
import GuideHeading from './guide-heading'
import GuideImage from './guide-image'
import GuideStep from './guide-step'

export default function GuideCarousel() {
  const { activeIndex, startSequenceFrom } = useGuideCarousel()
  const current = guideCarousel[activeIndex]
  const displayStep = activeIndex + 1

  return (
    <>
      {/* PC */}
      <div className="hidden md:grid md:grid-cols-2">
        <GuideImage activeIndex={activeIndex} current={current} />
        <div className="md:grid md:h-[560px] md:grid-rows-10">
          <GuideHeading />
          <GuideStep activeIndex={activeIndex} startSequenceFrom={startSequenceFrom} />
        </div>
      </div>

      {/* SP */}
      <div className="md:hidden">
        <GuideHeading />
        <GuideImage activeIndex={activeIndex} current={current} />
        <GuideDescription data={current} displayStep={displayStep} />
      </div>
    </>
  )
}
