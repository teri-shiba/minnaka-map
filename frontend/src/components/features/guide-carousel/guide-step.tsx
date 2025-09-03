'use client'

import type { StepIndex } from '~/data/guide-carousel'
import { motion } from 'framer-motion'
import { guideCarousel } from '~/data/guide-carousel'
import { cn } from '~/utils/cn'
import GuideDescription from './guide-description'

interface Props {
  activeIndex: StepIndex
  startSequenceFrom: (index: StepIndex) => void
}

export default function GuideStep({ activeIndex, startSequenceFrom }: Props) {
  return (
    <>
      {guideCarousel.map((data, index) => {
        const isActive = activeIndex === index
        const displayStep = index + 1
        return (
          <motion.button
            key={data.title}
            type="button"
            className={cn(
              'relative cursor-pointer rounded-lg px-5 transition-colors row-span-3 text-left',
              isActive && 'bg-secondary',
            )}
            onClick={() => startSequenceFrom(index as StepIndex)}
            aria-label={`ステップ${displayStep} ${data.title}`}
          >
            <GuideDescription data={data} displayStep={displayStep} />
          </motion.button>
        )
      })}
    </>
  )
}
