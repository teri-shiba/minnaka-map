'use client'

import { cn } from '~/utils/cn'

interface RefLike<T extends HTMLElement> { current: T | null }

interface Props {
  children: React.ReactNode
  containerRef: RefLike<HTMLDivElement>
  className?: string
}

export default function RestaurantSidebarContainer({ containerRef, children, className }: Props) {
  return (
    <div
      ref={containerRef}
      className={cn('hidden-scrollbar max-h-dvh overflow-y-scroll p-6 md:w-2/5 md:min-w-[450px]', className)}
    >
      {children}
    </div>
  )
}
