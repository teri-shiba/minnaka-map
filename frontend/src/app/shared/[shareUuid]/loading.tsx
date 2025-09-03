import Section from '~/components/layout/section'
import { Skeleton } from '~/components/ui/skeleton'

export default async function Loading() {
  return (
    <>
      <Skeleton className="h-32 w-full rounded-none md:h-48" />
      <Section className="py-8 md:py-10">
        <div className="mx-auto max-w-lg space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex gap-2 [@media(max-width:335px)]:flex-col">
              <Skeleton className="size-32 shrink-0 grow-0 [@media(max-width:335px)]:w-full" />
              <div className="grow space-y-2">
                <Skeleton className="h-5 w-32 rounded-full md:h-6" />
                <Skeleton className="h-5 w-full md:h-6 md:w-64" />
                <Skeleton className="h-4 w-32 md:h-5" />
                <Skeleton className="h-4 w-32 md:h-5" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
