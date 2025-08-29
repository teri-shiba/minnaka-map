import type { CarouselData } from '~/types/carousel-data'

export default function GuideDescription({ data }: { data: CarouselData }) {
  return (
    <div className="relative px-5 text-secondary-foreground sm:px-0">
      <h3 className="pb-1 text-center sm:flex sm:items-center sm:justify-start sm:gap-2 sm:pb-3 sm:text-lg">
        <span className="hidden sm:flex sm:size-9 sm:items-center sm:justify-center sm:rounded-md sm:bg-primary sm:text-white">{data.id}</span>
        {data.title}
      </h3>
      <p className="sm:pl-12 sm:text-sm">{data.text}</p>
    </div>
  )
}
