'use client'

import { carouselData } from '~/data/carousel-data'
import { useCarousel } from '~/hooks/useCarousel'
import GuideDescription from './guide-description'
import GuideHeading from './guide-heading'
import GuideImage from './guide-image'
import GuideStep from './guide-step'

const dataMap = new Map<number, typeof carouselData[0]>(
  carouselData.map(data => [data.id, data]),
)

export default function GuideCarousel() {
  const { activeStep, startSequenceFrom } = useCarousel(carouselData, {
    autoPlay: true,
    interval: 3000,
    initialStep: 1,
  })

  const current = dataMap.get(activeStep) ?? carouselData[0]

  return (
    <>
      {/* SP */}
      <div className="md:hidden">
        <GuideHeading />
        <GuideImage
          activeStep={activeStep}
          current={current}
        />
        <GuideDescription data={current} />
      </div>

      {/* PC */}
      <div className="hidden md:grid md:grid-cols-2">
        <GuideImage
          activeStep={activeStep}
          current={current}
        />
        <div className="md:grid md:h-[560px] md:grid-rows-10">
          <GuideHeading />
          <GuideStep
            activeStep={activeStep}
            startSequenceFrom={startSequenceFrom}
          />
        </div>
      </div>
    </>
  )
}
