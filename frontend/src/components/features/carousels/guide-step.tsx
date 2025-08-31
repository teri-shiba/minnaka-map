'use client'

import type { CarouselResult } from '~/types/carousel'
import { motion } from 'framer-motion'
import { carouselData } from '~/data/carousel-data'
import { cn } from '~/utils/cn'
import GuideDescription from './guide-description'

export default function GuideStep({ activeStep, startSequenceFrom }: CarouselResult) {
  return (
    <>
      {carouselData.map(data => {
        const isActive = activeStep === data.id
        return (
          <motion.button
            key={data.id}
            className={cn(
              'relative cursor-pointer rounded-lg p-5 transition-colors row-span-3',
              isActive && 'bg-secondary',
            )}
            onClick={() => startSequenceFrom(data.id)}
            aria-label={`${data.id} ${data.title}`}
          >
            <GuideDescription data={data} />
          </motion.button>
        )
      })}
    </>
  )
}
