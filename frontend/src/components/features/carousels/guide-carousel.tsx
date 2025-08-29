'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { carouselData } from '~/data/carousel-data'
import { useCarousel } from '~/hooks/useCarousel'
import { cn } from '~/utils/cn'
import GuideDescription from './guide-description'
import GuideHeading from './guide-heading'
import GuideImage from './guide-image'

const dataMap = new Map<number, typeof carouselData[0]>(
  carouselData.map(data => [data.id, data]),
)

export default function GuideCarousel({ className }: { className?: string }) {
  const { activeStep, startSequenceFrom } = useCarousel(carouselData, {
    autoPlay: true,
    interval: 3000,
  })

  const current = dataMap.get(activeStep) ?? carouselData[0]

  return (
    <div className={className}>
      {/* SP */}
      <div className="sm:hidden">
        <GuideHeading />
        <GuideImage
          activeStep={activeStep}
          current={current}
        />
        <GuideDescription data={current} />
      </div>

      {/* PC */}
      <div className="hidden sm:flex sm:items-center">
        <GuideImage
          activeStep={activeStep}
          current={current}
        />
        {/* Steps */}
        <div className="flex w-1/2 flex-col gap-4">
          <GuideHeading />

          {carouselData.map(data => (
            <motion.div
              key={data.id}
              className={cn(
                'relative cursor-pointer rounded-lg p-5 transition-colors',
                activeStep === data.id && 'bg-secondary',
              )}
              onClick={() => startSequenceFrom}
            >
              <GuideDescription data={data} />
              <AnimatePresence>
                {activeStep === data.id && (
                  <motion.div
                    className="absolute inset-0 -z-10 rounded-lg bg-secondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
