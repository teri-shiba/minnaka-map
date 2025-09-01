'use client'

import type { GuideCarousel } from '~/types/guide-carousel'

interface Props {
  data: GuideCarousel
  displayStep: number
}

export default function GuideDescription({ data, displayStep }: Props) {
  return (
    <div className="relative h-32 px-5 py-3 text-secondary-foreground md:h-auto md:p-0">
      <h3 className="flex items-center justify-center gap-2 pb-2 text-center md:justify-start">
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-md bg-primary text-sm text-white sm:text-base md:size-9"
        >
          {displayStep}
        </span>
        <span className="sr-only">
          ステップ
          {displayStep}
        </span>
        {data.title}
      </h3>
      <p className="text-sm leading-relaxed md:pl-12">{data.text}</p>
    </div>
  )
}
