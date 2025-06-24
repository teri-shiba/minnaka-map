'use client'

import type { CarouselData } from '~/data/carouselData'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '~/utils/utils'

interface GuideItemProps {
  data: CarouselData
  isActive: boolean
  onClick: (id: number) => void
}
export default function GuideItem({ data, isActive, onClick }: GuideItemProps) {
  return (
    <motion.div
      className={cn(
        'relative cursor-pointer rounded-lg p-5 transition-colors',
        isActive && 'bg-secondary',
      )}
      onClick={() => onClick(data.id)}
    >
      <div className="relative">
        <h3 className="flex items-center justify-start gap-2 pb-3 text-lg text-secondary-foreground">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-white">
            {data.id}
          </span>
          {data.title}
        </h3>
        <p className="pl-12 text-sm text-secondary-foreground">{data.text}</p>
      </div>
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-lg bg-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
