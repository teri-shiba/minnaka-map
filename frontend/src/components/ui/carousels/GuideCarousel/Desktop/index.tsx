'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { carouselData } from '~/data/carousel-data'
import { useCarousel } from '~/hooks/useCarousel'
import GuideItem from './GuideItem'

const dataMap = new Map<number, typeof carouselData[0]>(
  carouselData.map(data => [data.id, data]),
)

export default function DesktopGuideCarousel({ className }: { className?: string }) {
  const { activeStep, startSequenceFrom } = useCarousel(carouselData, {
    autoPlay: true,
    interval: 3000,
  })

  const current = dataMap.get(activeStep)

  return (
    <div className={className}>
      {/* Images */}
      <div className="w-1/2 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="inline-block drop-shadow-xl"
          >
            <Image
              alt={current?.title || ''}
              src={current?.imageUrl || ''}
              width={280}
              height={560}
              priority
              className="rounded-lg"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Steps */}
      <div className="flex w-1/2 flex-col gap-4">
        <h2 className="mb-3 pl-5 text-2xl text-secondary-foreground">
          <span className="inline-block align-text-top">
            <Image
              alt="minnaka map"
              src="/logo.webp"
              width={170}
              height={30}
              priority
              className="w-60"
            />
          </span>
          <span className="inline-block pl-1">の使い方</span>
        </h2>
        {carouselData.map(data => (
          <GuideItem
            key={data.id}
            data={data}
            isActive={activeStep === data.id}
            onClick={startSequenceFrom}
          />
        ))}
      </div>
    </div>
  )
}
