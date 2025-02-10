import type { EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import { carouselData } from '~/lib/data/carouselData'
import logo from '~/public/logo.webp'
import { Card, CardContent } from '../cards/Card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from './Carousel'

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

export function MobileGuideCarousel() {
  return (
    <section className="relative block py-8 before:absolute before:left-0 before:top-0 before:z-[-1] before:h-2/3 before:w-full before:rounded-2xl before:bg-secondary md:hidden">
      <h2 className="mb-7 text-center text-lg text-secondary-foreground sm:text-2xl md:mb-12">
        <span className="inline-block align-text-bottom">
          <Image
            alt="minnaka map"
            src={logo}
            width={170}
            height={30}
            className="w-44 sm:w-60"
          />
        </span>
        <span className="inline-block pl-0.5">の使い方</span>
      </h2>
      <Carousel opts={carouselOptions} plugins={carouselPlugins}>
        <CarouselContent>
          {carouselData.map(data => (
            <CarouselItem key={data.id}>
              <Card className="bg-transparent">
                <CardContent className="mx-5 flex flex-col items-center justify-center">
                  <div className="mb-5 h-96 w-72 overflow-hidden drop-shadow-lg">
                    <Image
                      alt={data.title}
                      src={data.imageUrl}
                      width={280}
                      height={380}
                      className=""
                    />
                  </div>
                  <h3 className="mb-2 flex gap-2 text-base text-secondary-foreground">
                    <span className="flex size-6 items-center justify-center rounded-sm bg-primary text-sm text-white">
                      {data.id}
                    </span>
                    {data.title}
                  </h3>
                  <p className="text-secondary-foreground">{data.text}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
