import { Skeleton } from '~/components/ui/skeleton/Skeleton'
import { createSequence } from '~/utils/array'

export default function Loading() {
  return (
    <div className="relative mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl overflow-hidden sm:flex">
      <Skeleton className="h-[calc(60vh-4rem)] w-full md:h-[calc(100vh-4rem)] md:w-3/5" />
      <div className="w-2/5 p-6">
        <div className="flex flex-wrap items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-36" />
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
