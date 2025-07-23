import { Skeleton } from '~/components/ui/skeleton/Skeleton'
import LoadingIcon from '~/public/figure_loading_circle.svg'
import { createSequence } from '~/utils/array'

export default function Loading() {
  return (
    <div className="relative mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl overflow-hidden md:flex">
      <div className="relative h-mobile-map w-full md:h-desktop-map md:w-3/5 md:flex-1">
        <Skeleton className="size-full rounded-none" />
        <LoadingIcon
          aria-label="ローディング中"
          width={40}
          height={40}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <div className="rounded-t-[10px] border px-5 py-4 md:w-2/5 md:min-w-96 md:shrink-0 md:rounded-none md:border-none md:p-6">
        <div className="mx-auto mb-2 h-1 w-9 cursor-grabbing rounded-full bg-gray-200" />
        <div className="mb-4 overflow-x-hidden border-b py-4 md:hidden">
          <div className="flex w-full min-w-max gap-2">
            {createSequence(6).map(id => (
              <Skeleton key={id} className="inline-block h-10 w-20" />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32 md:h-10" />
          <Skeleton className="hidden md:block md:h-10 md:w-36" />
        </div>
        <div className="mt-4 space-y-4">
          {createSequence(10).map(id => (
            <div key={id} className="flex gap-2 [@media(max-width:335px)]:flex-col">
              <Skeleton className="size-32 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-full max-w-60" />
                {createSequence(2).map(innerId => (
                  <Skeleton key={innerId} className="h-5 w-full max-w-80 " />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
