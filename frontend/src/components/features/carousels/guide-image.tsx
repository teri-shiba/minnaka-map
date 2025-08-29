'use client'

import type { CarouselData } from '~/types/carousel-data'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'

interface Props {
  activeStep: number
  current: CarouselData
}

export default function GuideImage({ activeStep, current }: Props) {
  return (
    <div className="pb-4 text-center sm:w-1/2">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="inline-block drop-shadow-lg sm:drop-shadow-xl"
        >
          <Image
            alt={current.title || ''}
            src={current.imageUrl || ''}
            width={280}
            height={380}
            priority
            className="aspect-[2/3] rounded-lg object-cover object-top sm:aspect-auto sm:object-none"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
