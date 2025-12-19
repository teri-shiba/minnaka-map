'use client'

import type { StepIndex } from '~/data/guide-carousel'
import type { GuideCarousel } from '~/types/guide-carousel'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'

interface Props {
  activeIndex: StepIndex
  current: GuideCarousel
}

export default function GuideImage({ activeIndex, current }: Props) {
  return (
    <div className="px-5 text-center md:px-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative inline-block aspect-[2/3] w-full max-w-[280px] overflow-hidden drop-shadow-lg md:aspect-[1/2] md:drop-shadow-xl"
        >
          <Image
            alt={current.title || ''}
            src={current.imageUrl || ''}
            fill
            sizes="(max-width: 767px) 100vw, 280px"
            priority={activeIndex === 0}
            className="object-cover object-top"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
