import { Skeleton } from '~/components/ui/skeleton/Skeleton'
import LoadingIcon from '~/public/figure_loading_circle.svg'
import { createSequence } from '~/utils/array'

export default function Loading() {
  return (
    <div className="relative mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl overflow-hidden sm:flex">
      <div className="relative h-mobile-map w-full md:h-desktop-map md:w-3/5">
        <Skeleton className="size-full" />
        <LoadingIcon
          aria-label="ローディング中"
          width={40}
          height={40}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <div className="p-6 md:w-2/5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="mt-4 space-y-4">
          {createSequence(10).map(id => (
            <div key={id} className="flex gap-2 [@media(max-width:335px)]:flex-col">
              <Skeleton className="size-32" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-80" />
                {createSequence(2).map(innerId => (
                  <Skeleton key={innerId} className="h-5 w-80 " />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
