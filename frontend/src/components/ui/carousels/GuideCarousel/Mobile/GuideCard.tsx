'use client'

import type { CarouselData } from '~/data/carousel-data'
import Image from 'next/image'
import { Card, CardContent } from '~/ui/cards/Card'

interface GuideCardProps {
  data: CarouselData
}

export default function GuideCard({ data }: GuideCardProps) {
  return (
    <Card className="bg-transparent">
      <CardContent className="mx-5 flex flex-col items-center justify-center">
        <div className="mb-5 h-96 w-72 overflow-hidden drop-shadow-lg">
          <Image
            alt={data.title}
            src={data.imageUrl}
            width={280}
            height={380}
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
  )
}
