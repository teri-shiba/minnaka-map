'use client'

import type { UseEmblaCarouselType } from 'embla-carousel-react'
import type { ComponentProps, HTMLAttributes, KeyboardEvent, RefObject } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { createContext, use, useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'

import { Button } from '~/components/ui/buttons/Button'
import { cn } from '~/lib/utils'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

interface CarouselProps {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = use(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

function Carousel({ ref, orientation = 'horizontal', opts, setApi, plugins, className, children, ...props }: HTMLAttributes<HTMLDivElement> & CarouselProps & { ref?: RefObject<HTMLDivElement> }) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  )

  const canScrollPrev = useSyncExternalStore((callback) => {
    if (!api)
      return () => {}

    api.on('select', callback)
    api.on('reInit', callback)

    return () => {
      api.off('select', callback)
      api.off('reInit', callback)
    }
  }, () => api?.canScrollPrev() ?? false, () => false)

  const canScrollNext = useSyncExternalStore((callback) => {
    if (!api)
      return () => {}

    api.on('select', callback)
    api.on('reInit', callback)

    return () => {
      api.off('select', callback)
      api.off('reInit', callback)
    }
  }, () => api?.canScrollNext() ?? false, () => false)

  const scrollPrev = useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'LuArrowLeft') {
        event.preventDefault()
        scrollPrev()
      }
      else if (event.key === 'LuArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext],
  )

  useEffect(() => {
    if (!api || !setApi) {
      return
    }

    setApi(api)
  }, [api, setApi])

  const contextValue = useMemo(() => ({
    carouselRef,
    api,
    opts,
    orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
  }), [carouselRef, api, opts, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext])

  return (
    <CarouselContext value={contextValue}>
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext>
  )
}
Carousel.displayName = 'Carousel'

function CarouselContent({ ref, className, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: RefObject<HTMLDivElement> }) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? '' : '-mt-4 flex-col',
          className,
        )}
        {...props}
      />
    </div>
  )
}
CarouselContent.displayName = 'CarouselContent'

function CarouselItem({ ref, className, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: RefObject<HTMLDivElement> }) {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  )
}
CarouselItem.displayName = 'CarouselItem'

function CarouselPrevious({ ref, className, variant = 'outline', size = 'icon', ...props }: ComponentProps<typeof Button> & { ref?: RefObject<HTMLButtonElement | null> }) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute  h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <LuArrowLeft className="size-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}
CarouselPrevious.displayName = 'CarouselPrevious'

function CarouselNext({ ref, className, variant = 'outline', size = 'icon', ...props }: ComponentProps<typeof Button> & { ref?: RefObject<HTMLButtonElement | null> }) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-right-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <LuArrowRight className="size-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}
CarouselNext.displayName = 'CarouselNext'

export {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
}
