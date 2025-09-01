'use client'

import type { AnimationControls } from 'framer-motion'
import { motion } from 'framer-motion'
import { cn } from '~/utils/cn'

interface RefLike<T extends HTMLElement> { current: T | null }

interface Props {
  children: React.ReactNode
  dragConstraints: { top: number, bottom: number }
  controls: AnimationControls
  contentRef: RefLike<HTMLDivElement>
  className?: string
  labelledById?: string
}

export default function RestaurantDrawerContainer({
  dragConstraints,
  controls,
  contentRef,
  labelledById,
  children,
  className,
}: Props) {
  return (
    <motion.div
      drag="y"
      dragConstraints={dragConstraints}
      animate={controls}
      className={cn('absolute z-40 h-drawer w-full', className)}
      style={{ bottom: 'env(safe-area-inset-bottom, 0px)' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
    >
      <div
        ref={contentRef}
        className="rounded-t-[10px] border bg-background px-5 py-4"
      >
        <div className="mx-auto mb-2 h-1 w-9 cursor-grabbing rounded-full bg-gray-200" />
        <div onTouchStart={e => e.stopPropagation()} style={{ touchAction: 'pan-y' }}>
          {children}
        </div>
      </div>
    </motion.div>
  )
}
