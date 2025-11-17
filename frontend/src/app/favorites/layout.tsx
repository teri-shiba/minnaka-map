import { Suspense } from 'react'
import Section from '~/components/layout/section'
import Loading from '../loading'

export default async function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="flex h-32 flex-col items-center justify-center bg-secondary md:h-48">
        <h1 className="text-2xl font-bold">お気に入り一覧</h1>
      </header>

      <Section className="py-8 md:py-10">
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </Section>
    </>
  )
}
