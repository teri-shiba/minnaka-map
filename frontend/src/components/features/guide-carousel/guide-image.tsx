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
          className="inline-block drop-shadow-lg md:drop-shadow-xl"
        >
          <Image
            alt={current.title || ''}
            src={current.imageUrl || ''}
            width={280}
            height={560}
            loading="lazy"
            className="relative aspect-[2/3] object-cover object-top md:aspect-auto md:object-none"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
