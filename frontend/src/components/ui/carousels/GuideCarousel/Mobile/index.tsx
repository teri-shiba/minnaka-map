'use client'

import type { EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import { carouselData } from '~/data/carousel-data'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '../../Carousel'
import GuideCard from './GuideCard'

const carouselOptions: Partial<EmblaOptionsType> = {
  align: 'start',
  loop: true,
}

const carouselPlugins = [
  Autoplay({
    delay: 4000,
    stopOnInteraction: false,
  }),
]

export default function MobileGuideCarousel() {
  return (
    <>
      <h2 className="mb-7 text-center text-lg text-secondary-foreground sm:text-2xl md:mb-12">
        <span className="inline-block align-text-bottom">
          <Image
            alt="minnaka map"
            src="/logo.webp"
            width={170}
            height={30}
            priority
            className="w-44"
          />
        </span>
        <span className="inline-block pl-0.5">の使い方</span>
      </h2>

      <Carousel opts={carouselOptions} plugins={carouselPlugins}>
        <CarouselContent>
          {carouselData.map(data => (
            <CarouselItem key={data.id}>
              <GuideCard data={data} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  )
}
