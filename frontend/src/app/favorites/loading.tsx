import Section from '~/components/layout/section'
import { Skeleton } from '~/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <header className="flex h-32 flex-col items-center justify-center bg-secondary md:h-48">
        <h1 className="text-2xl font-bold">
          お気に入り一覧
        </h1>
      </header>
      <Section
        className="py-8 md:py-10"
        aria-busy="true"
        aria-label="お気に入り店舗情報を読み込み中"
      >
        <div className="mx-auto max-w-lg">
          <div className="text-center">
            <Skeleton className="mb-2 inline-block h-8 w-2/3 min-w-24 md:h-8" />
            <Skeleton className="mb-4 inline-block h-10 w-full max-w-52 rounded-full md:mb-8" />
          </div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 2 }, (_, i) => i + 1).map(key => (
              <div key={key} className="flex flex-row gap-2 [@media(max-width:335px)]:flex-col">
                <Skeleton className="size-32 shrink-0 rounded-lg [@media(max-width:335px)]:w-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-5 w-2/3 min-w-28 md:h-6" />
                  <Skeleton className="h-4 w-2/4 min-w-20 md:w-1/3" />
                  <Skeleton className="h-4 w-2/4 min-w-20 md:w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
