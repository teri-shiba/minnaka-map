import Section from '~/components/layout/section'
import { Skeleton } from '~/components/ui/skeleton'

export default function Loading() {
  return (
    <Section
      className="mb-6 md:mb-8"
      aria-busy="true"
      aria-label="店舗詳細情報を読み込み中"
    >
      <p className="sr-only" role="status" aria-live="polite">
        店舗情報を読み込み中です
      </p>

      <div aria-hidden="true">
        <div className="flex flex-col-reverse py-4 md:items-start md:justify-between md:border-b md:py-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-full md:h-8 md:w-80" />
            <Skeleton className="h-14 w-full md:h-5 md:w-80" />
          </div>
          <div className="mb-4 ml-auto flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="md:flex md:flex-row md:justify-between md:gap-6 md:pt-8">
          <Skeleton className="mb-6 h-60 w-full md:mb-0 md:size-56 md:shrink-0" />
          <div className="md:flex-1">
            <Skeleton className="mb-4 h-6 w-full md:h-7 md:w-80" />
            <Skeleton className="h-80 w-full md:h-96" />
          </div>
        </div>
      </div>
    </Section>
  )
}
