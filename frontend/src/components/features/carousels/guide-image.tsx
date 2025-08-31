'use client'

import type { CarouselData } from '~/types/carousel'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useMemo } from 'react'

interface Props {
  activeStep: number
  current: CarouselData
}

export default function GuideImage({ activeStep, current }: Props) {
  const isPriority = useMemo(() => {
    return typeof current.id === 'number' && current.id === activeStep
  }, [activeStep, current])

  return (
    <div className="px-5 text-center md:px-0">
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
            priority={isPriority}
            loading={isPriority ? 'eager' : 'lazy'}
            decoding="async"
            className="relative aspect-[2/3] object-cover object-top md:aspect-auto md:object-none"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
