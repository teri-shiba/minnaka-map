import { Skeleton } from '~/components/ui/skeleton'

export default function Loading() {
  return (
    <div
      className="mx-auto h-[calc(100dvh-4rem)] max-w-screen-2xl md:flex"
      aria-busy="true"
      aria-label="検索結果を読み込み中"
    >
      <p className="sr-only" role="status" aria-live="polite">
        検索結果を読み込み中です
      </p>

      <div aria-hidden="true" className="flex h-full flex-col md:w-full md:flex-row">
        <Skeleton className="h-mobile-map w-full md:h-desktop-map md:w-3/5 md:flex-1" />
        <div
          className="
            flex-1 overflow-hidden
            rounded-t-[10px] border-x border-t border-border p-6
            md:w-2/5 md:overflow-visible md:rounded-none md:border-none md:p-6
          "
        >
          <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-border md:hidden" />
          <Skeleton className="my-4 h-10 w-full md:hidden" />
          <div className="md:flex md:justify-between md:gap-2 md:pb-4">
            <Skeleton className="my-4 h-6 w-full md:my-0 md:h-10 md:w-1/3 md:max-w-32" />
            <Skeleton className="hidden md:block md:h-10 md:w-2/3 md:max-w-52" />
          </div>
          <div className="flex flex-col gap-y-4">
            {Array.from({ length: 5 }, (_, i) => i + 1).map(key => (
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
      </div>
    </div>
  )
}
