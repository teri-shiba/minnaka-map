'use client'

import type { CarouselData } from '~/types/carousel'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'

interface Props {
  activeStep: number
  current: CarouselData
}

export default function GuideImage({ activeStep, current }: Props) {
  return (
    <div className="text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
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
            priority
            className="relative aspect-[2/3] object-cover object-top md:aspect-auto md:object-none"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
